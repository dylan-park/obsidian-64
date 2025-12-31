# Obsidian 64

### Security Notice

**This plugin does not provide any security benefit. Your data is only being encoded, not encrypted. This should only be used for data obfuscation and to avoid things like your data being indexed. Privacy is only implied if the reader does not decode the text.**

This plugin allows for easy encoding and decoding of Base64 data.

Its purpose is to allow users to have a basic level of obfuscation ability in their notes. It provides the most basic level of privacy by not allowing your notes to be read at all without decoding either with the plugin, or any other way. It also avoids the indexing of personal data on whatever OS the user is currently using, or on whatever service they are using to synchronize files, ensuring personal data does not show up in searches there.

It can also just be used for partial text encoding/decoding, if that functionality is desirable. This allows you to encode only specific parts of a file, for example.

**Note:** Any file encoded with Base64 will (temporarily) lose all markdown and thus obsidian based functionality. This means links and backlinks will break, files linked after it will not appear correctly in the graph view, and obviously all other plugin/markdown functionalities will temporarily stop working. Once properly decoded, all functionality involving plaintext files should return exactly as they were before.

## Features

### Multiple Encoding Iterations
The plugin supports encoding text multiple times for increased obfuscation. You can configure the number of iterations (1-15) in the plugin settings. When you encode text, it will be Base64 encoded the specified number of times. The iteration count is automatically embedded in the encoded output, so decoding will automatically apply the correct number of decoding passes.

**Backwards Compatibility:** Text encoded with older versions of the plugin (single iteration, no embedded marker) will still decode correctly.

## Usage

The plugin's functions can be accessed by using the 2 commands in the command palette:
- Obsidian 64: Encode to Base64
- Obsidian 64: Decode from Base64

These can also be added to the mobile toolbar for easier access on some devices.

## Settings

Access the plugin settings to configure:
- **Iterations**: Set how many times text should be encoded (1-15). Higher values provide more obfuscation but will result in longer encoded strings.