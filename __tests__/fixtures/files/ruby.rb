# frozen_string_literal: true

$LOAD_PATH.unshift __dir__ # For use/testing when no gem is installed

# Require all of the Ruby files in the given directory.
#
# path - The String relative path from here to the directory.
#
# Returns nothing.
def require_all(path)
  glob = File.join(__dir__, path, "*.rb")
  Dir[glob].sort.each do |f|
    require f
  end
end

# rubygems
require "rubygems"

# stdlib
require "pathutil"
require "forwardable"
require "fileutils"
require "time"
require "English"
require "pathname"
require "logger"
require "set"

# 3rd party
require "safe_yaml/load"
require "liquid"
require "kramdown"
require "colorator"

# @todo Check that Ruby works