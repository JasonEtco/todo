import json

class Things(IntraPy):
    def __init__(self):
        self.rules = []
        super().__init__()

    # @todo Does this work
    def do_a_thing(self, accreditation_id: int):
        response = self.api_get_single("/test/" + str(hi), "GET")
        accreditation = json.loads(response.content)
        return accreditation
