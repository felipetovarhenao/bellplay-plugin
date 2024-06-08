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

Here's the process for generating `src/bellplay.json`;

1. Use the `docs/bellplay_docgen.bell` script to generate a raw, text-based version of the documentation as a `llll` tree, by feeding it into `bellplay~` itself. This will generate a new file: `docs/bellplay_docs.txt`
2. Run `docs_to_json.py`, which assumes `docs/bellplay_docs.txt` already exists. If everything goes well, this should generate `src/bellplay.json` and the extension should be able to access an updated version of the `bellplay~` documentation.
