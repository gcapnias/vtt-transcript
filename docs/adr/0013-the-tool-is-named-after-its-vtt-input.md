# The tool is named after its VTT input: `vtt-transcript`

`yt-transcript` started as a harness around `yt-dlp` for YouTube. It now also fetches X posts and
transcribes Microsoft Teams meeting exports, so the `yt-` name described one site out of three
(#23). **The tool, its command, its package, its standalone executable and its GitHub repository
are all named `vtt-transcript`, with nothing kept under the old name. The name refers to the WebVTT
subtitle files every transcript is made from.** The one description used everywhere is: "Turns the
subtitles of YouTube and X videos, and Microsoft Teams meeting exports, into Markdown transcripts
that read as prose, as dialog or as a meeting, for use as agent input or reference material. It
produces transcripts, never summaries."

- **The name says `vtt` even though `.srt` is read too.** A meeting must be a `.vtt` file, and
  `yt-dlp` hands over `.vtt` for almost every fetch. However, no `--sub-format` is passed, so an
  `.srt` track is ranked lower but still accepted and parsed (`src/subtitle-track.js`,
  `src/ytdlp.js`). The name describes the input the user hands over and recognizes. It does not
  limit what the tool accepts, and SRT support must not be dropped because of it.
- **"vtt" is not a glossary term.** The domain words are still **Subtitle track** and **Cue**.
  The file format stays out of `GLOSSARY.md`, as `.srt` does.
- **No `yt-transcript` alias.** The tool has one user, its version is below 1.0, and no release
  had been published, so a second `bin` entry would only keep the old branding alive.

## Considered options

- **A name for the output** (`verbatim`, `transcript-md`). This was recommended during triage
  because the Transcript is what the user keeps. It was rejected because the maintainer wanted
  the name to say what the tool takes in.
- **A name for the cue** (`cuebook`, `cue2md`). This is more accurate, because a cue is the same
  in VTT and SRT. It was rejected because `.vtt` is the word users recognize, and **Cue** is an
  intermediate that never appears in a transcript.
- **`vtt2md`**. This is shorter, but "md" names a file format and drops the **Transcript**.
  `vtt-transcript` keeps the shape of the old name with only the source changed.
- **A name for the action** (`transcribe`, `scribe`). This was rejected because **Transcribe**
  already means acting on a meeting only.

## Consequences

- Changing the command name is a breaking change, and the next version records it as one.
- Old GitHub URLs and issue links keep working through GitHub's rename redirects, but every live
  reference is updated anyway. Earlier ADRs and `archive/research/` keep the old name where they
  describe the past.
