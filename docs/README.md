## Generating the reference documentation

For this extension to work, we need to generate a `src/bellplay.json` file, which looks something like this:

```json
[
  {
    "name": "fun",
    "description": "a function",
    "args": [
      { "name": "arg1" },
      {
        "name": "arg2",
        "default": 1
      }
    ]
  }
]
```

Since `bellplay~` is continuously changing, it's seemed best to develop a pipeline to transpiling the original documentation, instead of maintaining separate copies.

Check `md_to_json.py` file to ensure the `BELLPLAY_REPO` variable points to the top directory of the `bellplay` repo. This assumes that the markdown files in the repo have already been generated. If that's the case, all we need to do left is run:

```zsh
python3 ./docs/md_to_json.py
```
