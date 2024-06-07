import json
from tree_parser import TreeParser
import os

file = "./bellplay_docs.txt"
path = os.path.abspath(file)

if not os.path.exists(path):
    raise FileNotFoundError(
        f"{file} does not exist. You must generate a .txt version of the bellplay reference, using the bellplay_docgen.bell script.")

# load tree parser class
parser = TreeParser(path)
raw_tree = parser.parse()
formatted_tree = []

# for each function category (generators, utils, processors, etc)
for function_category in raw_tree:
    functions = function_category[1:]
    # for each function in current category
    for function in functions:
        func_name = function[0]
        func_descr = None
        func_args = []
        for function_property in function[1:]:
            func_prop_key = function_property[0]
            func_prop_value = function_property[1:]
            if func_prop_key == "description:":
                if type(func_prop_value) == list:
                    func_prop_value = " ".join([str(x) for x in func_prop_value])
                
                # remove backslashes added by bell when description includes parens
                func_descr = func_prop_value.replace("\\", "")

            # parse arguments
            elif func_prop_key == "arguments:":
                arguments = func_prop_value
                if arguments[0] == "none":
                    continue
                for args_category in arguments:
                    subargs = args_category[1:]
                    for arg in subargs:
                        arg_default = None
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
                        argname = arg[0].split(" ")[0]
                        if arg_default is not None:
                            argname = f'{argname} (default: {
                                arg_default})'
                        func_args.append({"name": argname})
        formatted_tree.append({
            "name": func_name,
            "description": func_descr,
            "args": func_args
        })
with open("../src/data/bellplay.json", "w") as f:
    json.dump(formatted_tree, f, indent=4)
