import sublime, sublime_plugin
import re

class StringifyJavascript(sublime_plugin.TextCommand):
	def run(self, edit):
		for region in self.view.sel():
			if not region.empty():
				text = re.sub(r'([\\"\'])', r'\\\1', self.view.substr(region))
				self.view.replace(edit, region, text)

class DeStringifyJavascript(sublime_plugin.TextCommand):
	def run(self, edit):
		for region in self.view.sel():
			if not region.empty():
				text = re.sub(r'\\\\', r'\\', self.view.substr(region))
				text = re.sub(r'\\(["\'])', r'\1',text)
				self.view.replace(edit, region, text)

class StringifyHtml(sublime_plugin.TextCommand):
	def run(self, edit):
		for region in self.view.sel():
			if not region.empty():
				text = re.sub(r'([\\\'])', r'\\\1', self.view.substr(region))
				text = re.sub(r'\n(\s*)', r"'+\n\1'", text)
				text = '\'\'+\n\''+text+'\''
				self.view.replace(edit, region, text)

class PreHtml(sublime_plugin.TextCommand):
	def run(self, edit):
		for region in self.view.sel():
			if not region.empty():
				text = re.sub(r'<', r'&lt;', self.view.substr(region))
				text = re.sub(r'>', r'&gt;', text)
				self.view.replace(edit, region, text)

class DePreHtml(sublime_plugin.TextCommand):
	def run(self, edit):
		for region in self.view.sel():
			if not region.empty():
				text = re.sub(r'&lt;', r'<', self.view.substr(region))
				text = re.sub(r'&gt;', r'>', text)
				self.view.replace(edit, region, text)
