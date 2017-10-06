// Package event provides the functions for creating, editing, and showing events
package event

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/alecthomas/template"
	helpers "github.com/devopsdays/devopsdays-cli/helpers"
	paths "github.com/devopsdays/devopsdays-cli/helpers/paths"
	"github.com/devopsdays/devopsdays-cli/images"
	"github.com/devopsdays/devopsdays-cli/model"
	"github.com/fatih/color"
	survey "gopkg.in/AlecAivazis/survey.v1"
)

var LogoPath string
var SquareLogoPath string

// the questions to ask
var qsCreateEvent = []*survey.Question{
	{
		Name: "twitter",
		Prompt: &survey.Input{
			Message: "Enter your devopsdays event twitter handle (defaults to @devopsdays):",
			Help:    "Twitter username can include the @ symbol or not. Examples: '@devopsdays' or 'devopsdays",
		},
		Validate: func(val interface{}) error {
			if str, _ := val.(string); (str != "") && (helpers.ValidateField(str, "twitter") == false) {
				return errors.New("Please enter a valid Twitter handle. Spaces are not allowed.")
			}
			return nil
		},
	},
	{
		Name: "description",
		Prompt: &survey.Input{
			Message: "Enter a description of your event [optional]:",
			Help:    "One or two sentences to descript the event. Defaults to Devopsdays is coming to CITY!",
		},
	},
	{
		Name: "googleanalytics",
		Prompt: &survey.Input{
			Message: "Enter your Google Analytics ID [optional]:",
			Help:    "This will allow your page to be tracked. Example: UA-74738648-1.",
		},
	},
	{
		Name: "startdate",
		Prompt: &survey.Input{
			Message: "Enter the event's start date [optional]:",
			Help:    "You can only provide a date for your event if you have a signed contract with your venue.",
		},
	},
	{
		Name: "enddate",
		Prompt: &survey.Input{
			Message: "Enter the event's end date [optional]:",
			Help:    "For single-day events make the end date the same as the start date. You can only provide a date for your event if you have a signed contract with your venue.",
		},
	},
	{
		Name: "coordinates",
		Prompt: &survey.Input{
			Message: "Enter the coordinates of your venue [optional]:",
			Help:    "Get Latitude and Longitude of a Point: http://itouchmap.com/latlong.html. Example: 41.882219, -87.640530",
		},
	},
	{
		Name: "location",
		Prompt: &survey.Input{
			Message: "Enter the name of your venue [optional]:",
			Help:    "If you do not enter a value here, it will default to your city name.",
		},
	},
	{
		Name: "locationaddress",
		Prompt: &survey.Input{
			Message: "Enter the address of your venue [optional]:",
			Help:    "Use the street address of your venue. This will show up on the welcome page if set.",
		},
	},
	{
		Name: "logopath",
		Prompt: &survey.Input{
			Message: "Enter the path to your event's logo, for use on your event's home page. [optional]",
			Help:    "Path to logo image. Must be a PNG file. Example: /Users/mattstratton/Pictures/chicago.png.",
		},
		Validate: func(val interface{}) error {
			str, _ := val.(string)
			if str != "" {
				if _, err := os.Stat(str); err != nil {
					return errors.New("File not found.")
				}
			}

			return nil
		},
	},
	{
		Name: "squarelogopath",
		Prompt: &survey.Input{
			Message: "Enter the path to your event's square logo, for use on the main home page. [optional]",
			Help:    "Path to logo image. Must be a PNG file, 600 x 600 px. Example: /Users/mattstratton/Pictures/chicago-square.png.",
		},
		Validate: func(val interface{}) error {
			str, _ := val.(string)
			if str != "" {
				if _, err := os.Stat(str); err != nil {
					return errors.New("File not found.")
				}
			}

			return nil
		},
	},
}

// CreateEvent takes input from the user to create a new event
func CreateEvent(city, year string) (err error) {

	answers := struct {
		Twitter         string
		Description     string
		GoogleAnalytics string
		StartDate       string
		EndDate         string
		Coordinates     string
		Location        string
		LocationAddress string
		LogoPath        string
		SquareLogoPath  string
	}{}

	if city == "" {
		prompt := &survey.Input{
			Message: "Enter the city name:",
		}
		survey.AskOne(prompt, &city, survey.Required)
	}

	if year == "" {
		prompt := &survey.Input{
			Message: "Enter the year:",
		}
		survey.AskOne(prompt, &year, survey.Required)
	}

	surveyErr := survey.Ask(qsCreateEvent, &answers)
	if surveyErr != nil {
		fmt.Println(surveyErr.Error())
		return
	}

	orgEmail := []string{"organizers-", strings.Replace(strings.TrimSpace(strings.ToLower(CityClean(city))), " ", "-", 10), "-", strings.TrimSpace(year), "@devopsdays.org"}
	proposalEmail := []string{"proposals-", CityClean(city), "-", strings.TrimSpace(year), "@devopsdays.org"}
	myEvent := model.Event{
		Name:            strings.Join([]string{strings.TrimSpace(year), "-", CityClean(city)}, ""),
		Year:            year,
		City:            city,
		EventTwitter:    helpers.TwitterClean(answers.Twitter),
		Description:     answers.Description,
		GoogleAnalytics: answers.GoogleAnalytics,
		StartDate:       answers.StartDate,
		EndDate:         answers.EndDate,
		Coordinates:     answers.Coordinates,
		Location:        answers.Location,
		LocationAddress: answers.LocationAddress,
		OrganizerEmail:  strings.Join(orgEmail, ""),
		ProposalEmail:   strings.Join(proposalEmail, ""),
	}

	NewEvent(myEvent, CityClean(city), year)

	if answers.LogoPath != "" {
		err = EventLogo(answers.LogoPath, CityClean(city), year)
	}

	if answers.SquareLogoPath != "" {
		err = EventLogoSquare(answers.SquareLogoPath, CityClean(city), year)
	}

	return
}

// NewEvent takes in a constructed Event type and generates the stuff
func NewEvent(event model.Event, city string, year string) (err error) {
	t := template.New("Event template")

	t, err = t.Parse(eventTmpl)
	if err != nil {
		log.Fatal("Parse: ", err)
		return
	}
	f, err := os.Create(paths.EventDataPath(paths.GetWebdir(), city, year))
	defer f.Close()
	t.Execute(f, event)

	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Fprintf(color.Output, "\n\n\nCreated event file for %s\n", color.GreenString(event.City))
		fmt.Fprintf(color.Output, "at %s\n\n\n", color.BlueString(paths.EventDataPath(paths.GetWebdir(), city, year)))
	}
	return
}

// EventLogo takes in a path to an event's main logo and copies/renames it to the proper destination
func EventLogo(srcPath, city, year string) (err error) {

	eventStaticPath, err := paths.EventStaticPath(city, year)
	if err != nil {
		log.Fatal(err)
	}
	err = helpers.CopyFile(srcPath, filepath.Join(eventStaticPath, "logo.png"))

	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil

}

// EventLogoSquare takes in a path the event's square logo, and crops/resizes it and copies it to the proper destination
func EventLogoSquare(srcPath, city, year string) (err error) {
	eventStaticPath, err := paths.EventStaticPath(city, year)
	if err != nil {
		log.Fatal(err)
	}
	destPath := filepath.Join(eventStaticPath, "logo-square.png")
	images.ResizeImage(srcPath, destPath, "png", 600, 600)

	// @TODO update helpers.ResizeImage to return error code and do something with it here

	return nil
}
