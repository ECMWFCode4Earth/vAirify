class RequestBuilder:
    def __init__(self):
        self.request_body = {}

    def with_date(self, date_string: str) -> dict:
        self.request_body['date'] = date_string
        return self

    def with_type(self, type_string: str) -> dict:
        self.request_body['type'] = type_string
        return self

    def with_format(self, format_string: str) -> dict:
        self.request_body['format'] = format_string
        return self

    def with_time(self, time_string: str) -> dict:
        self.request_body['time'] = time_string
        return self

    def with_leadtime_hour(self, leadtime_hour_string: str) -> dict:
        self.request_body['leadtime_hour'] = leadtime_hour_string
        return self

    def with_variables(self, variable_string: str) -> dict:
        self.request_body['variable'] = variable_string
        return self

    def with_model_level(self, model_level: str) -> dict:
        self.request_body['model_level'] = model_level
        return self

    def build(self):
        return self.request_body
