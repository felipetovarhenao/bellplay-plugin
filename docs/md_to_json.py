import os
import glob
import re
import yaml
import json

BASE_DIR = os.path.dirname(__file__)

BELLPLAY_REPO = '/Users/felipetovarhenao/Documents/bellplay/'

# Explicit configuration variables
# Path to directory containing .md files
markdown_directory = os.path.join(BELLPLAY_REPO, 'website/docs/reference/')
# Path for the resulting JSON file
output_json_file = os.path.join(BASE_DIR, '../src/bellplay.json')


def get_version():
    bellplay_main = os.path.join(BELLPLAY_REPO, 'data/__bellplay__.bell')
    with open(bellplay_main, 'r') as f:
        script = f.read()
    version = re.search(
        r"^(?:BP_VERSION\s*=\s*)([^;]+)", script, re.DOTALL)
    if not version:
        raise LookupError("bellplay~ version not found")
    return version.group(1).replace("\"", "").replace("'", "")


def clean_markdown(text: str) -> str:
    # Remove YAML header at the top
    text = re.sub(r'^---\s*\n.*?\n---\s*\n', '', text, flags=re.DOTALL)

    # Remove admonition blocks
    text = re.sub(r':::.*?\n.*?\n:::.*?\n?', '', text, flags=re.DOTALL)

    # Remove title
    text = re.sub(r'## `[^`]+`\s*\n', '', text, flags=re.DOTALL)

    return text


def clean_admonitions(text):
    """
    Convert :::type blocks into markdown blockquotes with bold labels.
    Supports types: note, warning, danger, tip, info, etc.
    """
    def _replace(match):
        kind = match.group(1).capitalize()
        body = match.group(2).strip()
        return f"> **{kind}:** {body}"

    pattern = re.compile(
        r':::(note|warning|danger|tip|info)\n([\s\S]*?)\n:::',
        re.IGNORECASE
    )
    return pattern.sub(_replace, text)


def parse_markdown_file(file_path):
    """
    Parse a markdown file defining a function into a structured dict.

    Extracts optional YAML frontmatter, function name, signature,
    description, arguments, output, and usage sections.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Extract YAML frontmatter if present
    frontmatter = {}
    fm_match = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
    if fm_match:
        frontmatter = yaml.safe_load(fm_match.group(1)) or {}
        content = text[fm_match.end():]
    else:
        content = text

    # 2. Function name from first level-2 heading with backticks
    name_match = re.search(r'## `([^`]+)`', content)
    name = name_match.group(1) if name_match else None

    # 3. Signature: code block after heading
    sig_match = re.search(r'```bell\n([\s\S]*?)```', content)
    signature = sig_match.group(1).strip() if sig_match else None

    # 4. Description: text between signature block and next section delimiter
    desc_match = re.search(
        r'```bell[\s\S]*?```\s*\n(.*?)(?=^---|^### )', content, re.DOTALL | re.MULTILINE)
    description = desc_match.group(1).strip() if desc_match else None

    # 5. Arguments: list items under ### Arguments
    arguments = []
    args_match = re.search(
        r'^### Arguments\n([\s\S]*?)(?=^### |^---|\Z)', content, re.DOTALL | re.MULTILINE)
    if args_match:
        args_block = args_match.group(1)
        current_arg = None
        for raw_line in args_block.splitlines():
            stripped = raw_line.strip()
            # top‑level argument
            # top‑level argument: name, optional '?', type, description, extras
            m = re.match(
                r'-\s+`@([^`\s]+)`\s+\[_\*\*([^\*_]+)\*\*_\]\s*:\s*(.*?)\s*(?:\((.*)\))(?:\.|$)',
                stripped
            )
            if m:
                arg_name, arg_type, desc, extras = m.groups()
                # determine required/default
                required = bool(
                    extras and 'required' in extras.lower())
                default = None
                if extras:
                    dm = re.search(r'default_?:\s*`([^`]+)`', extras)
                    if dm:
                        default = dm.group(1)
                # record argument
                current_arg = {
                    'name': arg_name,
                    'type': arg_type,
                    'description': desc.strip(),
                    'required': required,
                    'default': default,
                    'options': []
                }
                arguments.append(current_arg)
            else:
                # nested enum‑option line under the last argument
                om = re.match(r'^\s*-\s*`?([^`]+)`?\s*:\s*(.+)', raw_line)
                if om and current_arg is not None:
                    value, desc = om.groups()
                    current_arg['options'].append({
                        'value': int(value) if value.isnumeric() else value,
                        'description': desc.strip()
                    })
                # else: ignore any other lines

    # 6. Output section
    output = None
    out_match = re.search(
        r'^### Output\s*\n([\s\S]*?)(?=^### |^---|\Z)',
        content,
        re.DOTALL | re.MULTILINE
    )
    if out_match:
        out_block = out_match.group(1).strip()
        # grab the bracketed type at the end or start: "name text [type]" or "[type] name text"
        bt = re.search(r'\[\*\*_([^\]]+)_\*\*\]', out_block)
        if bt:
            output_type = bt.group(1)
            # remove the brackets and content
            out_block = re.sub(r":::\w+\n.*\n:::", "", out_block)
            name_desc = re.sub(r'\[[^\]]+\]', '',
                               out_block).strip()

        else:
            output_type = None
            name_desc = out_block
        # apply admonition cleanup on any description content
        output = {
            'description': name_desc,
            'type': output_type
        }

    # 7. Usage section: code block under ### Usage
    usage = None
    usage_match = re.search(
        r'^### Usage\n```bell\n([\s\S]*?)```', content, re.DOTALL | re.MULTILINE)
    if usage_match:
        usage = usage_match.group(1).strip()

    docstring = clean_markdown(text)
    if 'tags' in frontmatter:
        docstring += f"""
### See also

{" ".join(f'`{t}`' for t in frontmatter['tags'])}

"""
    # Aggregate into dict
    return {
        'name': name,
        # 'signature': signature,
        # 'description': clean_admonitions(description),
        'args': arguments,
        # 'output': output,
        # 'usage': usage,
        # 'tags': frontmatter.get('tags', []),
        "markdown": docstring,
    }


def main():
    """
    Parse all markdown files in the configured directory and write JSON output.
    """
    version = get_version()
    pattern = os.path.join(markdown_directory, '**/*.md')
    markdown_files = glob.glob(pattern)
    parsed_functions = []

    for md_file in markdown_files:
        parsed = parse_markdown_file(md_file)
        parsed_functions.append(parsed)

    # Write the list of function definitions to JSON
    with open(output_json_file, 'w', encoding='utf-8') as outfile:
        json.dump({'version': version, 'reference': parsed_functions},
                  outfile, indent=2, ensure_ascii=False)


# Execute parsing when run as a script
main()
