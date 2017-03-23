import sublime, sublime_plugin

compJS = [
    # my completion
    ("document.write()\tcheng","document.write(${1:String});"),
    ("console.log()\tcheng","console.log(${1:String});"),
    ("function\ncheng","function ${1:func}(${2}){\n\t${3}\n}"),
    ("document.write.random\ncheng","document.write(Math.floor(Math.random() * ${1:10} + ${2:99}));")
]

compAll = list(compJS)      # could use different lists

class ChengAndyJSCompletions(sublime_plugin.EventListener):
    def on_query_completions(self, view, prefix, locations):
        global compAll
        if not (view.match_selector(locations[0],
                                    'source.js -string -comment -constant') or
                view.match_selector(locations[0],
                                    'source.ts -string -comment -constant')):
            return []
        completions = []
        pt = locations[0] - len(prefix) - 1
        # get the character before the trigger
        ch = view.substr(sublime.Region(pt, pt + 1)) if pt >= 0 else None
        if ch == '.': pass
        else: pass
        word = view.word(pt - 1) if pt >= 0 else None
        word = view.substr(word) if word is not None else None
        if word is not None and len(word) > 1:
            pass # could check for window or document
        completions = compAll
        compDefault = [view.extract_completions(prefix)]
        compDefault = [(item + "\tDefault", item) for sublist in compDefault
            for item in sublist if len(item) > 3]       # flatten
        compDefault = list(set(compDefault))        # make unique
        compFull = list(completions)
        compFull.extend(compDefault)
        compFull.sort()
        return (compFull, sublime.INHIBIT_WORD_COMPLETIONS |
            sublime.INHIBIT_EXPLICIT_COMPLETIONS)
