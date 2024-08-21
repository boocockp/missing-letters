const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento
const {importModule, importHandlers} = Elemento
const WordList = await import('../files/words2.js').then(...importHandlers('Words'))

// MainPage.js
function MainPage(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Data, Calculation, Timer, TextElement, Dialog, Button, Block, TextInput} = Elemento.components
    const {Split, Range, Len, WithoutItems, If, Select, ListContains, ForEach, Gte, Eq, And, Not, Or, RandomFrom, Log, RandomListFrom, FlatList, Ceiling, Join} = Elemento.globalFunctions
    const {Set, Reset} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const MaxGuesses = _state.setObject(pathTo('MaxGuesses'), new Data.State(stateProps(pathTo('MaxGuesses')).value(3).props))
    const Word = _state.setObject(pathTo('Word'), new Data.State(stateProps(pathTo('Word')).props))
    const PositionsShown = _state.setObject(pathTo('PositionsShown'), new Data.State(stateProps(pathTo('PositionsShown')).value([]).props))
    const GapsShown = _state.setObject(pathTo('GapsShown'), new Data.State(stateProps(pathTo('GapsShown')).value(false).props))
    const LatestGuess = _state.setObject(pathTo('LatestGuess'), new Data.State(stateProps(pathTo('LatestGuess')).props))
    const NumberOfGuesses = _state.setObject(pathTo('NumberOfGuesses'), new Data.State(stateProps(pathTo('NumberOfGuesses')).value(0).props))
    const Status = _state.setObject(pathTo('Status'), new Data.State(stateProps(pathTo('Status')).value('Ready').props))
    const Score = _state.setObject(pathTo('Score'), new Data.State(stateProps(pathTo('Score')).value(0).props))
    const RoundSkipped = _state.setObject(pathTo('RoundSkipped'), new Data.State(stateProps(pathTo('RoundSkipped')).value(false).props))
    const Letters = _state.setObject(pathTo('Letters'), new Calculation.State(stateProps(pathTo('Letters')).value(Split(Word)).props))
    const AllPositions = _state.setObject(pathTo('AllPositions'), new Calculation.State(stateProps(pathTo('AllPositions')).value(Range(0, Len(Word) - 1)).props))
    const RemainingPositions = _state.setObject(pathTo('RemainingPositions'), new Calculation.State(stateProps(pathTo('RemainingPositions')).value(WithoutItems(AllPositions, PositionsShown)).props))
    const LettersShownOnly = _state.setObject(pathTo('LettersShownOnly'), new Calculation.State(stateProps(pathTo('LettersShownOnly')).value(Select(Letters, ($item, $index) => ListContains(PositionsShown, $index))).props))
    const LettersShownWithGaps = _state.setObject(pathTo('LettersShownWithGaps'), new Calculation.State(stateProps(pathTo('LettersShownWithGaps')).value(ForEach(Letters, ($item, $index) => If(ListContains(PositionsShown, $index), $item, '_'))).props))
    const LettersShown = _state.setObject(pathTo('LettersShown'), new Calculation.State(stateProps(pathTo('LettersShown')).value(If(GapsShown, LettersShownWithGaps, LettersShownOnly)).props))
    const UsedAllGuesses = _state.setObject(pathTo('UsedAllGuesses'), new Calculation.State(stateProps(pathTo('UsedAllGuesses')).value(Gte(NumberOfGuesses, MaxGuesses)).props))
    const ShownAllLetters = _state.setObject(pathTo('ShownAllLetters'), new Calculation.State(stateProps(pathTo('ShownAllLetters')).value(Len(RemainingPositions) == 0).props))
    const IsRoundWon = _state.setObject(pathTo('IsRoundWon'), new Calculation.State(stateProps(pathTo('IsRoundWon')).value(Eq(LatestGuess,Word)).props))
    const IsRoundFailed = _state.setObject(pathTo('IsRoundFailed'), new Calculation.State(stateProps(pathTo('IsRoundFailed')).value(And(Not(IsRoundWon), Or(ShownAllLetters, UsedAllGuesses))).props))
    const GameRunning = _state.setObject(pathTo('GameRunning'), new Calculation.State(stateProps(pathTo('GameRunning')).value(Or(Status == 'Playing', Status == 'Paused')).props))
    const IsRoundComplete = _state.setObject(pathTo('IsRoundComplete'), new Calculation.State(stateProps(pathTo('IsRoundComplete')).value(Or(IsRoundWon, IsRoundFailed, RoundSkipped, Not(GameRunning))).props))
    const Points = _state.setObject(pathTo('Points'), React.useCallback(wrapFn(pathTo('Points'), 'calculation', (word) => {
        let lettersGuessed = Len(RemainingPositions)
        let penalties = (NumberOfGuesses - 1) * 2
        let pointsFactor = If(GapsShown, 2, 4)
        let letterPoints = Math.round(Math.pow(lettersGuessed, 1.3) * pointsFactor) - penalties
        return Math.max(letterPoints, 0)
    }), [RemainingPositions, NumberOfGuesses, GapsShown]))
    const EndRound = _state.setObject(pathTo('EndRound'), React.useCallback(wrapFn(pathTo('EndRound'), 'calculation', () => {
        return Set(Score, Score + Points())
    }), [Score, Points]))
    const WhenRoundComplete_whenTrueAction = React.useCallback(wrapFn(pathTo('WhenRoundComplete'), 'whenTrueAction', async () => {
        await EndRound()
    }), [EndRound])
    const WhenRoundComplete = _state.setObject(pathTo('WhenRoundComplete'), new Calculation.State(stateProps(pathTo('WhenRoundComplete')).value(IsRoundComplete).whenTrueAction(WhenRoundComplete_whenTrueAction).props))
    const EndGame = _state.setObject(pathTo('EndGame'), React.useCallback(wrapFn(pathTo('EndGame'), 'calculation', () => {
        Set(Status, 'Ended')
        return EndRound()
    }), [Status, EndRound]))
    const GameTimer_endAction = React.useCallback(wrapFn(pathTo('GameTimer'), 'endAction', async ($timer) => {
        await EndGame()
    }), [EndGame])
    const GameTimer = _state.setObject(pathTo('GameTimer'), new Timer.State(stateProps(pathTo('GameTimer')).period(180).interval(1).endAction(GameTimer_endAction).props))
    const PauseGame = _state.setObject(pathTo('PauseGame'), React.useCallback(wrapFn(pathTo('PauseGame'), 'calculation', () => {
        Set(Status, 'Paused')
        return GameTimer.Stop()
    }), [Status, GameTimer]))
    const ContinueGame = _state.setObject(pathTo('ContinueGame'), React.useCallback(wrapFn(pathTo('ContinueGame'), 'calculation', () => {
        Set(Status, 'Playing')
        return GameTimer.Start()
    }), [Status, GameTimer]))
    const ShowNewLetter = _state.setObject(pathTo('ShowNewLetter'), React.useCallback(wrapFn(pathTo('ShowNewLetter'), 'calculation', () => {
        let nextPosition = RandomFrom(RemainingPositions)
        return Set(PositionsShown, FlatList(PositionsShown, nextPosition))
    }), [RemainingPositions, PositionsShown]))
    const Instructions = _state.setObject(pathTo('Instructions'), new Dialog.State(stateProps(pathTo('Instructions')).initiallyOpen(false).props))
    const StatsLayout = _state.setObject(pathTo('StatsLayout'), new Block.State(stateProps(pathTo('StatsLayout')).props))
    const ReadyPanel = _state.setObject(pathTo('ReadyPanel'), new Block.State(stateProps(pathTo('ReadyPanel')).props))
    const PlayPanel = _state.setObject(pathTo('PlayPanel'), new Block.State(stateProps(pathTo('PlayPanel')).props))
    const WordStatus = _state.setObject(pathTo('WordStatus'), new Block.State(stateProps(pathTo('WordStatus')).props))
    const GuessEntry = _state.setObject(pathTo('GuessEntry'), new Block.State(stateProps(pathTo('GuessEntry')).props))
    const YourGuess = _state.setObject(pathTo('YourGuess'), new TextInput.State(stateProps(pathTo('YourGuess')).props))
    const SetupNewRound = _state.setObject(pathTo('SetupNewRound'), React.useCallback(wrapFn(pathTo('SetupNewRound'), 'calculation', () => {
        let word = RandomFrom(WordList())
        Log('word', word)
        Set(Word, word)
        let positions = Range(0, Len(word) - 1)
        Set(PositionsShown, RandomListFrom(positions, Len(word) / 2))
        return Reset(YourGuess, LatestGuess, NumberOfGuesses, GapsShown)
    }), [Word, PositionsShown, YourGuess, LatestGuess, NumberOfGuesses, GapsShown]))
    const StartNewRound = _state.setObject(pathTo('StartNewRound'), React.useCallback(wrapFn(pathTo('StartNewRound'), 'calculation', () => {
        Reset(RoundSkipped)
        return SetupNewRound()
    }), [RoundSkipped, SetupNewRound]))
    const StartNewGame = _state.setObject(pathTo('StartNewGame'), React.useCallback(wrapFn(pathTo('StartNewGame'), 'calculation', () => {
        Reset(Score)
        Reset(GameTimer)
        Set(Status, 'Playing')
        StartNewRound()
        return GameTimer.Start()
    }), [Score, GameTimer, Status, StartNewRound]))
    const MakeGuess = _state.setObject(pathTo('MakeGuess'), React.useCallback(wrapFn(pathTo('MakeGuess'), 'calculation', () => {
        Set(LatestGuess, YourGuess)
        return Set(NumberOfGuesses, NumberOfGuesses + 1)
    }), [LatestGuess, YourGuess, NumberOfGuesses]))
    const WordControls = _state.setObject(pathTo('WordControls'), new Block.State(stateProps(pathTo('WordControls')).props))
    const EndedPanel = _state.setObject(pathTo('EndedPanel'), new Block.State(stateProps(pathTo('EndedPanel')).props))
    const RoundControls = _state.setObject(pathTo('RoundControls'), new Block.State(stateProps(pathTo('RoundControls')).props))
    const PausePanel = _state.setObject(pathTo('PausePanel'), new Block.State(stateProps(pathTo('PausePanel')).props))
    const Spacer = _state.setObject(pathTo('Spacer'), new Block.State(stateProps(pathTo('Spacer')).props))
    const GameControls = _state.setObject(pathTo('GameControls'), new Block.State(stateProps(pathTo('GameControls')).props))
    const StartGame2_action = React.useCallback(wrapFn(pathTo('StartGame2'), 'action', async () => {
        await StartNewGame()
        await Instructions.Close()
    }), [StartNewGame, Instructions])
    const Guess_action = React.useCallback(wrapFn(pathTo('Guess'), 'action', async () => {
        await MakeGuess()
    }), [MakeGuess])
    const ShowAnotherLetter_action = React.useCallback(wrapFn(pathTo('ShowAnotherLetter'), 'action', async () => {
        await ShowNewLetter()
    }), [ShowNewLetter])
    const ShowGaps_action = React.useCallback(wrapFn(pathTo('ShowGaps'), 'action', () => {
        Set(GapsShown, true)
    }), [GapsShown])
    const NewRound_action = React.useCallback(wrapFn(pathTo('NewRound'), 'action', async () => {
        await StartNewRound()
    }), [StartNewRound])
    const SkipRound_action = React.useCallback(wrapFn(pathTo('SkipRound'), 'action', () => {
        Set(RoundSkipped, true)
    }), [RoundSkipped])
    const StartGame_action = React.useCallback(wrapFn(pathTo('StartGame'), 'action', async () => {
        await StartNewGame()
    }), [StartNewGame])
    const StopGame_action = React.useCallback(wrapFn(pathTo('StopGame'), 'action', async () => {
        await EndGame()
    }), [EndGame])
    const PauseGame_action = React.useCallback(wrapFn(pathTo('PauseGame'), 'action', async () => {
        await PauseGame()
    }), [])
    const ContinueGame_action = React.useCallback(wrapFn(pathTo('ContinueGame'), 'action', async () => {
        await ContinueGame()
    }), [])
    const Instructions_action = React.useCallback(wrapFn(pathTo('Instructions'), 'action', async () => {
        await Instructions.Show()
    }), [])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('MaxGuesses')).display(false).props),
        React.createElement(Data, elProps(pathTo('Word')).display(false).props),
        React.createElement(Data, elProps(pathTo('PositionsShown')).display(false).props),
        React.createElement(Data, elProps(pathTo('GapsShown')).display(false).props),
        React.createElement(Data, elProps(pathTo('LatestGuess')).display(false).props),
        React.createElement(Data, elProps(pathTo('NumberOfGuesses')).display(false).props),
        React.createElement(Data, elProps(pathTo('Status')).display(false).props),
        React.createElement(Data, elProps(pathTo('Score')).display(false).props),
        React.createElement(Data, elProps(pathTo('RoundSkipped')).display(false).props),
        React.createElement(Calculation, elProps(pathTo('Letters')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('AllPositions')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('RemainingPositions')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('LettersShown')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('LettersShownOnly')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('LettersShownWithGaps')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('UsedAllGuesses')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('ShownAllLetters')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundWon')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundFailed')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('WhenRoundComplete')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundComplete')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('GameRunning')).show(false).props),
        React.createElement(Timer, elProps(pathTo('GameTimer')).show(false).props),
        React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).fontFamily('Chelsea Market').fontSize('28').color('#039a03').props).content('Mis_ing L_tters').props),
        React.createElement(Dialog, elProps(pathTo('Instructions')).layout('vertical').showCloseButton(true).styles(elProps(pathTo('Instructions.Styles')).padding('2em').props).props,
            React.createElement(TextElement, elProps(pathTo('InstructionsText')).allowHtml(true).content(`You have to guess words from which you are given about half the letters.  The letters are in order, but you do not know where they come in the word (unless you ask).


Enter your guesses - up to three in the box and click the Guess button.  You can also show more letters, and show the gaps in the word.  


But guess what - guesses, showing letters and showing gaps all reduce the number of points you get for the word, so you need to decide whether to use those or just puzzle it out.


Click Next Word when you complete or skip a word to get another one.


You have 3 minutes to guess as many words as you can.`).props),
            React.createElement(Button, elProps(pathTo('StartGame2')).content('Start Game').appearance('filled').show(Not(GameRunning)).action(StartGame2_action).props),
    ),
        React.createElement(Block, elProps(pathTo('StatsLayout')).layout('horizontal wrapped').styles(elProps(pathTo('StatsLayout.Styles')).fontSize('24').props).props,
            React.createElement(TextElement, elProps(pathTo('ScoreDisplay')).show(Or(GameRunning, Status == 'Ended')).styles(elProps(pathTo('ScoreDisplay.Styles')).fontSize('inherit').color('blue').marginRight('100').props).content(Score + ' points').props),
            React.createElement(TextElement, elProps(pathTo('TimeDisplay')).show(GameRunning).styles(elProps(pathTo('TimeDisplay.Styles')).fontSize('inherit').color('green').props).content(Ceiling(GameTimer. remainingTime) + 's left').props),
            React.createElement(TextElement, elProps(pathTo('GameOver')).show(Status == 'Ended').styles(elProps(pathTo('GameOver.Styles')).fontSize('inherit').color('white').backgroundColor('green').padding('0 0.5em').borderRadius('8px').props).content('Game Over').props),
    ),
        React.createElement(Block, elProps(pathTo('ReadyPanel')).layout('vertical').show(Status == 'Ready').styles(elProps(pathTo('ReadyPanel.Styles')).padding('0').props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).color('#039a03').fontFamily('Chelsea Market').fontSize('28').props).content('Welcome!').props),
            React.createElement(TextElement, elProps(pathTo('ReadyText')).styles(elProps(pathTo('ReadyText.Styles')).fontSize('20').props).content(`Guess words with letters missing.

Click Instructions for full details

Or Start Game to dive straight in!`).props),
    ),
        React.createElement(Block, elProps(pathTo('PlayPanel')).layout('vertical').show(Or(Status == 'Playing', Status == 'Ended')).styles(elProps(pathTo('PlayPanel.Styles')).width('100%').padding('0').props).props,
            React.createElement(TextElement, elProps(pathTo('WordLetters')).styles(elProps(pathTo('WordLetters.Styles')).fontSize('32').letterSpacing('0.2em').props).content(If(IsRoundComplete, Word, () => Join(LettersShown))).props),
            React.createElement(Block, elProps(pathTo('WordStatus')).layout('horizontal').styles(elProps(pathTo('WordStatus.Styles')).justifyContent('space-between').width('20em').props).props,
            React.createElement(TextElement, elProps(pathTo('PointsAvailable')).content(Points() + ' points').props),
            React.createElement(TextElement, elProps(pathTo('GuessesRemaining')).show(Not(IsRoundComplete)).content((MaxGuesses - NumberOfGuesses) + ' guesses left').props),
    ),
            React.createElement(Block, elProps(pathTo('GuessEntry')).layout('horizontal wrapped').props,
            React.createElement(TextInput, elProps(pathTo('YourGuess')).label('Your Guess').styles(elProps(pathTo('YourGuess.Styles')).fontSize('28').props).props),
            React.createElement(Button, elProps(pathTo('Guess')).content('Guess').appearance('outline').enabled(Not(IsRoundComplete)).action(Guess_action).props),
    ),
            React.createElement(TextElement, elProps(pathTo('RoundWon')).show(IsRoundWon).content('Correct! ' + Points() + ' points added').props),
            React.createElement(TextElement, elProps(pathTo('RoundFailed')).show(IsRoundFailed).content('Sorry - ' + If(UsedAllGuesses, 'no more guesses', () => If(ShownAllLetters, 'all letters shown'))).props),
            React.createElement(TextElement, elProps(pathTo('RoundSkipped')).show(RoundSkipped).content('Skipped').props),
            React.createElement(Block, elProps(pathTo('WordControls')).layout('horizontal wrapped').props,
            React.createElement(Button, elProps(pathTo('ShowAnotherLetter')).content('Show Another Letter').appearance('outline').enabled(Not(IsRoundComplete)).action(ShowAnotherLetter_action).props),
            React.createElement(Button, elProps(pathTo('ShowGaps')).content('Show Gaps').appearance('outline').enabled(Not(IsRoundComplete)).action(ShowGaps_action).props),
    ),
            React.createElement(Block, elProps(pathTo('EndedPanel')).layout('vertical').show(Status == 'Ended').props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).fontFamily('Chelsea Market').fontSize('28').color('#039a03').props).content('Congr_tulati_ns!').props),
            React.createElement(TextElement, elProps(pathTo('Score')).content('You have scored ' + Score + ' points!').props),
            React.createElement(TextElement, elProps(pathTo('Whatnext')).content('Click Start Game to have another go').props),
    ),
            React.createElement(Block, elProps(pathTo('RoundControls')).layout('horizontal').props,
            React.createElement(Button, elProps(pathTo('NewRound')).content('Next word').appearance('filled').show(Status == 'Playing' && IsRoundComplete).action(NewRound_action).props),
            React.createElement(Button, elProps(pathTo('SkipRound')).content('Skip this word').appearance('outline').show(Status == 'Playing' && Not(IsRoundComplete)).action(SkipRound_action).props),
    ),
    ),
        React.createElement(Block, elProps(pathTo('PausePanel')).layout('vertical').show(Status == 'Paused').styles(elProps(pathTo('PausePanel.Styles')).padding('0').props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).color('#7529df').fontFamily('Luckiest Guy').fontSize('28').props).content('Paused...').props),
            React.createElement(TextElement, elProps(pathTo('PauseText')).styles(elProps(pathTo('PauseText.Styles')).fontSize('20').props).content('Click Continue Game to carry on').props),
    ),
        React.createElement(Block, elProps(pathTo('Spacer')).layout('vertical').styles(elProps(pathTo('Spacer.Styles')).borderBottom('2px solid lightgray').width('100%').props).props),
        React.createElement(Block, elProps(pathTo('GameControls')).layout('horizontal').styles(elProps(pathTo('GameControls.Styles')).paddingTop('20px').props).props,
            React.createElement(Button, elProps(pathTo('StartGame')).content('Start Game').appearance('filled').show(Not(GameRunning)).action(StartGame_action).props),
            React.createElement(Button, elProps(pathTo('StopGame')).content('Stop Game').appearance('outline').show(GameRunning).action(StopGame_action).props),
            React.createElement(Button, elProps(pathTo('PauseGame')).content('Pause Game').appearance('outline').show(Status == 'Playing').action(PauseGame_action).props),
            React.createElement(Button, elProps(pathTo('ContinueGame')).content('Continue Game').appearance('outline').show(Status == 'Paused').action(ContinueGame_action).props),
            React.createElement(Button, elProps(pathTo('Instructions')).content('Instructions').appearance('outline').action(Instructions_action).props),
    ),
    )
}

// appMain.js
export default function MainApp(props) {
    const pathTo = name => 'MainApp' + '.' + name
    const {App} = Elemento.components
    const pages = {MainPage}
    const appContext = Elemento.useGetAppContext()
    const _state = Elemento.useGetStore()
    const app = _state.setObject('MainApp', new App.State({pages, appContext}))

    return React.createElement(App, {...elProps('MainApp').maxWidth(500).fonts(['Chelsea Market']).props},)
}
