import json
from tree_parser import TreeParser
import os
import re

THIS_DIR = os.path.dirname(__file__)
file = os.path.join(THIS_DIR, "bellplay_docs.txt")
path = os.path.abspath(file)

if not os.path.exists(path):
    raise FileNotFoundError(
        f"{file} does not exist. You must generate a .txt version of the bellplay reference, using the bellplay_docgen.bell script.")

# load tree parser class
parser = TreeParser(path)
raw_tree = parser.parse()
formatted_tree = []
version = raw_tree[0][1]
reference = raw_tree[1][1:]

# for each function category (generators, utils, processors, etc)
for function_category in reference:
    functions = function_category[1:]

    # for each function in current category
    for function in functions:
        func_name = function[0]
        func_descr = None
        func_args = []
        func_outkeys = None
        func_output = None
        for function_property in function[1:]:
            func_prop_key = function_property[0]
            func_prop_value = function_property[1:]
            if func_prop_key == "description:":
                if type(func_prop_value) == list:
                    func_prop_value = " ".join(
                        [str(x) for x in func_prop_value])

                # remove backslashes added by bell when description includes parens
                func_descr = func_prop_value.replace("\\", "")

            # parse arguments
            elif func_prop_key == "resulting buffer keys:":
                func_outkeys = []
                regex = re.compile(r'\'?(\w+)\'?')
                for x in func_prop_value:
                    outkey = regex.match(x[0]).group(1)
                    func_outkeys.append(outkey)
            elif func_prop_key == 'output:':
                if func_prop_value[0] is not None:
                    descr = func_prop_value[0][1]
                    out_type = func_prop_value[1][1]
                    func_output = {
                        "description": descr,
                        "type": out_type,
                    }

            elif func_prop_key == "arguments:":
                arguments = func_prop_value
                if arguments[0] == "none":
                    continue
                for args_category in arguments:
                    subargs = args_category[1:]
                    for arg in subargs:
                        arg_default = None
                        arg_type = None
                        arg_desc = None
                        arg_options = None

                        for arg_prop in arg[1:]:
                            if arg_prop[0] == "default:":
                                arg_default = arg_prop[1:]
                                if len(arg_default) == 1:
                                    arg_default = arg_default[0]
                                    if arg_default is None:
                                        arg_default = "null"
                                else:
                                    arg_default = " ".join(
                                        [str(x) for x in arg_default])
                            elif arg_prop[0] == "description:":
                                if len(arg_prop) > 1:
                                    arg_descr = arg_prop[1]
                            elif arg_prop[0] == "type:":
                                if len(arg_prop) > 1:
                                    arg_type = arg_prop[1]
                            elif arg_prop[0] == "options:":
                                raw_options = arg_prop[1:]
                                arg_options = []
                                for option in raw_options:
                                    if option[0].endswith(':'):
                                        arg_options.append({
                                            "value": option[0][:-1],
                                            "description": " ".join(option[1:])
                                        })
                                    else:
                                        arg_options.append(
                                            {"value": option[0]})

                        argname = arg[0].split(" ")[0]
                        arg_item = {
                            "name": argname[1:],
                            "description": arg_descr,
                            "type": arg_type,
                        }
                        if arg_options:
                            arg_item["options"] = arg_options
                        if arg_default is not None:
                            arg_item["default"] = None if arg_default == 'null' else arg_default
                        func_args.append(arg_item)
        if func_descr.startswith("`"):
            func_descr = func_descr[1:]
        doc_item = {
            "name": func_name,
            "description": func_descr,
            "args": func_args,
            "output": func_output
        }
        if func_outkeys:
            doc_item["buffer_keys"] = func_outkeys
        formatted_tree.append(doc_item)


formatted_tree.sort(key=lambda x: x["name"])
docs = {
    "version": version,
    "reference": formatted_tree
}
output_path = os.path.abspath(os.path.join(THIS_DIR, "../src/bellplay.json"))
with open(output_path, "w") as f:
    json.dump(docs, f, indent=4)

print("JSON documentation ready:", output_path)
