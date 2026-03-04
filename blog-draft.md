# title: The Daily Life of an Opus Addict

## tone

casual

## audience

developers, students, tech-curious

## tags

AI, Copilot, Developer Life, Claude Opus, AI Stories

## key_points

* Using Claude Opus for literally everything (even saying hi)
* Running out of context multiple times while analyzing a portfolio
* The AI agent scanning the workspace after a simple message like "ok"
* The funny reality of spending expensive AI compute on tiny tasks
* How AI-assisted development feels when you're deep in the workflow

## rough_draft

so basically this whole thing started when i asked copilot / opus to analyze my portfolio website

normal developer thing right? just like "analyze my site and see what can be improved"

BUT what followed was actually insane

first of all im apparently an opus addict. like im not even using smaller models for simple stuff. if i need something done, opus is the one doing it. architecture planning? opus. debugging? opus. explaining code? opus. making a txt file? also opus. one time i literally asked opus to just say "hi" back to me. that probably cost like $0.04 worth of compute just for a greeting

so when i asked it to analyze my portfolio site it went FULL engineer mode

it started reading the workspace, scanning files, looking at structure, components, routes, styles, all that stuff. the crazy part is this whole analysis was happening inside the chat context window. and that thing is big — something like 128k tokens or around there

and somehow we STILL ran out of context

not once

not twice

FOUR TIMES

every time the conversation would get huge because the agent kept reasoning about the codebase and suggesting improvements. eventually the context would just die, and claude, being an absolute monster, would go through the entire analysis process all over again by itself, rebuilding the context window to around 30% after forgetting older parts of the conversation.

which is actually kind of funny when you think about it

im sitting there watching my premium requests slowly disappear while opus is basically doing a full engineering review of a portfolio site

and the funniest moment happened later

at one point the AI gave me some output and i just replied with

"ok"

like a normal human acknowledgement

but inside the thinking / reasoning panel it started doing this whole analysis like

"user wasnt satisfied..."

then it literally started scanning the workspace again

reading files

checking code

looking for problems

and then it found some random bug in the portfolio that i would never have noticed

and just fixed it

then it replied with something like "heres the updated site"

all of that because i said

ok

so apparently "ok" can trigger autonomous debugging mode

the funniest part is that in the usage dashboard later you can see exactly how much compute went into these interactions

most of my usage is literally claude opus

like more than 80%

which basically means im using one of the strongest reasoning models available today for things like

* saying hi
* confirming stuff
* making small edits
* explaining things i already kind of understand
* and occasionally doing massive workspace analysis

its kind of ridiculous but also kind of amazing

because in a weird way this is the new developer workflow

instead of just coding alone, you're basically working with a ridiculously powerful AI teammate that sometimes overthinks everything

you say "ok"

it hears

"INITIATE FULL WORKSPACE INSPECTION"

and somewhere in a datacenter a GPU spins up just to make sure your portfolio website doesn't have a broken import

honestly

worth it
