# -*- coding: UTF-8 -*-
import sublime, sublime_plugin

class InsertNumberCommand(sublime_plugin.TextCommand):
    def run(self,edit):
        view=self.view
        sels=view.sel()
        sels_len=len(sels)
        for i in range(0,sels_len):
            view.replace(edit,sels[i],str(i))
