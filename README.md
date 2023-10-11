# Obsidian 64

### Security Notice

**This plugin does not provide any security benefit. Your data is only being encoded, not encrypted. This should only be used for data obfuscation and to avoid things like your data being indexed. Privacy is only implied if the reader does not decode the text.**

This plugin allows for easy encoding and decoding of Base64 data.

Its purpose is to allow users to have a basic level of obfuscation ability in their notes. It provides the most basic level of privacy by not allowing your notes to be read at all without decoding either with the plugin, or any other way. It also avoids the indexing of personal data on whatever OS the user is currently using, or on whatever service they are using to synchronize files, ensuring personal data does not show up in searches there.

It can also just be used for partial text encoding/decoding, if that functionality is desirable. This allows you to encode only specific parts of a file, for example.

**Note:** Any file encoded with Base64 will (temporarily) lose all markdown and thus obsidian based functionality. This means links and backlinks will break, files linked after it will not appear correctly in the graph view, and obviously all other plugin/markdown functionalities will temporarily stop working. Once properly decoded, all functionality involving plaintext files should return exactly as they were before.

## To-Do:

- Mobile support