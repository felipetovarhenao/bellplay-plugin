import re


class TreeParser:
    def __init__(self, filepath):
        self.filepath = filepath

    def parse(self):
        with open(self.filepath, 'r') as file:
            data = file.read()
        return self._parse_tree(data)

    def _parse_tree(self, text):
        def parse_value(value):
            if re.match(r'^\d+$', value):  # Integer
                return int(value)
            elif re.match(r'^\d+\.\d+$', value):  # Float
                return float(value)
            elif value in ("null", "nil"):  # Null values
                return None
            elif value.startswith('"') and value.endswith('"'):  # Quoted string
                return value[1:-1]
            else:  # Unquoted string
                return value

        def parse_list(tokens):
            result = []
            while tokens:
                token = tokens.pop(0)
                if token == '[':
                    result.append(parse_list(tokens))
                elif token == ']':
                    break
                else:
                    result.append(parse_value(token))
            return result

        tokens = re.findall(r'\[|\]|"(?:\\.|[^"\\])*"|[^\s\[\]]+', text)
        return parse_list(tokens)
