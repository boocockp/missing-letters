const runtimeUrl = window.elementoRuntimeUrl || 'https://elemento.online/lib/runtime.js'
const Elemento = await import(runtimeUrl)
const {React, trace, elProps, stateProps, wrapFn} = Elemento
const {importModule, importHandlers} = Elemento
const WordList = await import('../files/words2.js').then(...importHandlers('Words'))

// MainPage.js
function MainPage(props) {
    const pathTo = name => props.path + '.' + name
    const {Page, Data, Calculation, Timer, TextElement, Dialog, Button, Block, TextInput} = Elemento.components
    const {And, Not, Or, If, Log, Record, Split, Range, Len, WithoutItems, Select, ListContains, ForEach, Gte, RandomFrom, RandomListFrom, Eq, FlatList, Lowercase, Trim, Ceiling, Join} = Elemento.globalFunctions
    const {Reset, Set} = Elemento.appFunctions
    const _state = Elemento.useGetStore()
    const app = _state.useObject('MainApp')
    const {SendMessage, CurrentUrl} = app
    const Status = _state.setObject(pathTo('Status'), new Data.State(stateProps(pathTo('Status')).value('Ready').props))
    const Score = _state.setObject(pathTo('Score'), new Data.State(stateProps(pathTo('Score')).value(0).props))
    const RoundSkipped = _state.setObject(pathTo('RoundSkipped'), new Data.State(stateProps(pathTo('RoundSkipped')).value(false).props))
    const GameRunning = _state.setObject(pathTo('GameRunning'), new Calculation.State(stateProps(pathTo('GameRunning')).value(Or(Status == 'Playing', Status == 'Paused')).props))
    const SendScore = _state.setObject(pathTo('SendScore'), React.useCallback(wrapFn(pathTo('SendScore'), 'calculation', async (score) => {
        Log('Send Score', score)
        await SendMessage('parent', Record('score', score, 'url', (await CurrentUrl()).text))
    }), []))
    const EndGame = _state.setObject(pathTo('EndGame'), React.useCallback(wrapFn(pathTo('EndGame'), 'calculation', async () => {
        await SendScore(Score)
        Set(Status, 'Ended')
    }), [SendScore, Score, Status]))
    const GameTimer_endAction = React.useCallback(wrapFn(pathTo('GameTimer'), 'endAction', async ($timer) => {
        await EndGame()
    }), [EndGame])
    const GameTimer = _state.setObject(pathTo('GameTimer'), new Timer.State(stateProps(pathTo('GameTimer')).period(180).interval(1).endAction(GameTimer_endAction).props))
    const PauseGame = _state.setObject(pathTo('PauseGame'), React.useCallback(wrapFn(pathTo('PauseGame'), 'calculation', async () => {
        Set(Status, 'Paused')
        await GameTimer.Stop()
    }), [Status, GameTimer]))
    const ContinueGame = _state.setObject(pathTo('ContinueGame'), React.useCallback(wrapFn(pathTo('ContinueGame'), 'calculation', async () => {
        Set(Status, 'Playing')
        await GameTimer.Start()
    }), [Status, GameTimer]))
    const StopGame = _state.setObject(pathTo('StopGame'), React.useCallback(wrapFn(pathTo('StopGame'), 'calculation', async () => {
        await GameTimer.Stop()
        await EndGame()
    }), [GameTimer, EndGame]))
    const MaxGuesses = _state.setObject(pathTo('MaxGuesses'), new Data.State(stateProps(pathTo('MaxGuesses')).value(3).props))
    const Word = _state.setObject(pathTo('Word'), new Data.State(stateProps(pathTo('Word')).props))
    const PositionsShown = _state.setObject(pathTo('PositionsShown'), new Data.State(stateProps(pathTo('PositionsShown')).value([]).props))
    const GapsShown = _state.setObject(pathTo('GapsShown'), new Data.State(stateProps(pathTo('GapsShown')).value(false).props))
    const LatestGuess = _state.setObject(pathTo('LatestGuess'), new Data.State(stateProps(pathTo('LatestGuess')).props))
    const NumberOfGuesses = _state.setObject(pathTo('NumberOfGuesses'), new Data.State(stateProps(pathTo('NumberOfGuesses')).value(0).props))
    const Letters = _state.setObject(pathTo('Letters'), new Calculation.State(stateProps(pathTo('Letters')).value(Split(Word)).props))
    const AllPositions = _state.setObject(pathTo('AllPositions'), new Calculation.State(stateProps(pathTo('AllPositions')).value(Range(0, Len(Word) - 1)).props))
    const RemainingPositions = _state.setObject(pathTo('RemainingPositions'), new Calculation.State(stateProps(pathTo('RemainingPositions')).value(WithoutItems(AllPositions, PositionsShown)).props))
    const LettersShownOnly = _state.setObject(pathTo('LettersShownOnly'), new Calculation.State(stateProps(pathTo('LettersShownOnly')).value(Select(Letters, ($item, $index) => ListContains(PositionsShown, $index))).props))
    const LettersShownWithGaps = _state.setObject(pathTo('LettersShownWithGaps'), new Calculation.State(stateProps(pathTo('LettersShownWithGaps')).value(ForEach(Letters, ($item, $index) => If(ListContains(PositionsShown, $index), $item, '_'))).props))
    const LettersShown = _state.setObject(pathTo('LettersShown'), new Calculation.State(stateProps(pathTo('LettersShown')).value(If(GapsShown, LettersShownWithGaps, LettersShownOnly)).props))
    const UsedAllGuesses = _state.setObject(pathTo('UsedAllGuesses'), new Calculation.State(stateProps(pathTo('UsedAllGuesses')).value(Gte(NumberOfGuesses, MaxGuesses)).props))
    const ShownAllLetters = _state.setObject(pathTo('ShownAllLetters'), new Calculation.State(stateProps(pathTo('ShownAllLetters')).value(Len(RemainingPositions) == 0).props))
    const Points = _state.setObject(pathTo('Points'), React.useCallback(wrapFn(pathTo('Points'), 'calculation', (withNextGuess) => {
        let lettersGuessed = Len(RemainingPositions)
        let guessCount = NumberOfGuesses + (withNextGuess ? 1 : 0)
        let penalties = (guessCount - 1) * 4
        let pointsFactor = If(GapsShown, 4, 8)
        let letterPoints = Math.round(Math.pow(lettersGuessed, 1.3) * pointsFactor) - penalties
        return Math.max(letterPoints, 0)
    }), [RemainingPositions, NumberOfGuesses, GapsShown]))
    const RoundCorrect = _state.setObject(pathTo('RoundCorrect'), React.useCallback(wrapFn(pathTo('RoundCorrect'), 'calculation', () => {
        return Eq(LatestGuess,Word)
    }), [LatestGuess, Word]))
    const IsRoundWon = _state.setObject(pathTo('IsRoundWon'), new Calculation.State(stateProps(pathTo('IsRoundWon')).value(And(GameRunning, Not(RoundSkipped), RoundCorrect())).props))
    const RoundFailed = _state.setObject(pathTo('RoundFailed'), React.useCallback(wrapFn(pathTo('RoundFailed'), 'calculation', () => {
        return And(Not(RoundCorrect()), Or(ShownAllLetters, UsedAllGuesses))
    }), [RoundCorrect, ShownAllLetters, UsedAllGuesses]))
    const IsRoundFailed = _state.setObject(pathTo('IsRoundFailed'), new Calculation.State(stateProps(pathTo('IsRoundFailed')).value(And(GameRunning, Not(RoundSkipped), RoundFailed())).props))
    const IsRoundComplete = _state.setObject(pathTo('IsRoundComplete'), new Calculation.State(stateProps(pathTo('IsRoundComplete')).value(Or(IsRoundWon, IsRoundFailed, RoundSkipped, Not(GameRunning))).props))
    const RoundInPlay = _state.setObject(pathTo('RoundInPlay'), new Calculation.State(stateProps(pathTo('RoundInPlay')).value(Not(IsRoundComplete)).props))
    const RoundScoresPoints = _state.setObject(pathTo('RoundScoresPoints'), React.useCallback(wrapFn(pathTo('RoundScoresPoints'), 'calculation', () => {
        return RoundCorrect()
    }), [RoundCorrect]))
    const FinishRound = _state.setObject(pathTo('FinishRound'), React.useCallback(wrapFn(pathTo('FinishRound'), 'calculation', () => {}), []))
    const EndRound = _state.setObject(pathTo('EndRound'), React.useCallback(wrapFn(pathTo('EndRound'), 'calculation', async () => {
        await If(RoundScoresPoints(), () => Set(Score, Score + Points()))
        await FinishRound()
    }), [RoundScoresPoints, Score, Points, FinishRound]))
    const WhenRoundComplete_whenTrueAction = React.useCallback(wrapFn(pathTo('WhenRoundComplete'), 'whenTrueAction', async () => {
        await EndRound()
    }), [EndRound])
    const WhenRoundComplete = _state.setObject(pathTo('WhenRoundComplete'), new Calculation.State(stateProps(pathTo('WhenRoundComplete')).value(IsRoundComplete).whenTrueAction(WhenRoundComplete_whenTrueAction).props))
    const ShowNewLetter = _state.setObject(pathTo('ShowNewLetter'), React.useCallback(wrapFn(pathTo('ShowNewLetter'), 'calculation', () => {
        let nextPosition = RandomFrom(RemainingPositions)
        Set(PositionsShown, FlatList(PositionsShown, nextPosition))
    }), [RemainingPositions, PositionsShown]))
    const Instructions = _state.setObject(pathTo('Instructions'), new Dialog.State(stateProps(pathTo('Instructions')).initiallyOpen(false).props))
    const StatsLayout = _state.setObject(pathTo('StatsLayout'), new Block.State(stateProps(pathTo('StatsLayout')).props))
    const ReadyPanel = _state.setObject(pathTo('ReadyPanel'), new Block.State(stateProps(pathTo('ReadyPanel')).props))
    const PlayPanel = _state.setObject(pathTo('PlayPanel'), new Block.State(stateProps(pathTo('PlayPanel')).props))
    const RoundStatus = _state.setObject(pathTo('RoundStatus'), new Block.State(stateProps(pathTo('RoundStatus')).props))
    const GuessEntry = _state.setObject(pathTo('GuessEntry'), new Block.State(stateProps(pathTo('GuessEntry')).props))
    const YourGuess = _state.setObject(pathTo('YourGuess'), new TextInput.State(stateProps(pathTo('YourGuess')).props))
    const SetupNewRound = _state.setObject(pathTo('SetupNewRound'), React.useCallback(wrapFn(pathTo('SetupNewRound'), 'calculation', async () => {
        let word = RandomFrom(await WordList())
        Set(Word, word)
        let positions = Range(0, Len(word) - 1)
        Set(PositionsShown, RandomListFrom(positions, Len(word) / 2))
        Reset(YourGuess, LatestGuess, NumberOfGuesses, GapsShown)
    }), [Word, PositionsShown, YourGuess, LatestGuess, NumberOfGuesses, GapsShown]))
    const StartNewRound = _state.setObject(pathTo('StartNewRound'), React.useCallback(wrapFn(pathTo('StartNewRound'), 'calculation', async () => {
        Reset(RoundSkipped)
        await SetupNewRound()
    }), [RoundSkipped, SetupNewRound]))
    const StartNewGame = _state.setObject(pathTo('StartNewGame'), React.useCallback(wrapFn(pathTo('StartNewGame'), 'calculation', async () => {
        Reset(Score)
        Reset(GameTimer)
        Set(Status, 'Playing')
        await StartNewRound()
        await GameTimer.Start()
    }), [Score, GameTimer, Status, StartNewRound]))
    const MakeGuess = _state.setObject(pathTo('MakeGuess'), React.useCallback(wrapFn(pathTo('MakeGuess'), 'calculation', () => {
        Set(LatestGuess, Lowercase(Trim(YourGuess)))
        Set(NumberOfGuesses, NumberOfGuesses + 1)
    }), [LatestGuess, YourGuess, NumberOfGuesses]))
    const WordControls = _state.setObject(pathTo('WordControls'), new Block.State(stateProps(pathTo('WordControls')).props))
    const EndofGamePanel = _state.setObject(pathTo('EndofGamePanel'), new Block.State(stateProps(pathTo('EndofGamePanel')).props))
    const RoundControls = _state.setObject(pathTo('RoundControls'), new Block.State(stateProps(pathTo('RoundControls')).props))
    const PausePanel = _state.setObject(pathTo('PausePanel'), new Block.State(stateProps(pathTo('PausePanel')).props))
    const Spacer = _state.setObject(pathTo('Spacer'), new Block.State(stateProps(pathTo('Spacer')).props))
    const GameControls = _state.setObject(pathTo('GameControls'), new Block.State(stateProps(pathTo('GameControls')).props))
    const StartGame2_action = React.useCallback(wrapFn(pathTo('StartGame2'), 'action', async () => {
        await StartNewGame()
        await Instructions.Close()
    }), [StartNewGame, Instructions])
    const YourGuess_keyAction = React.useCallback(wrapFn(pathTo('YourGuess'), 'keyAction', async ($event) => {
        await If($event.key == 'Enter', async () => await MakeGuess())
    }), [MakeGuess])
    const Guess_action = React.useCallback(wrapFn(pathTo('Guess'), 'action', async () => {
        await If(Len(YourGuess) > 0, async () => await MakeGuess())
    }), [YourGuess, MakeGuess])
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
        await StopGame()
    }), [StopGame])
    const PauseGame_action = React.useCallback(wrapFn(pathTo('PauseGame'), 'action', async () => {
        await PauseGame()
    }), [PauseGame])
    const ContinueGame_action = React.useCallback(wrapFn(pathTo('ContinueGame'), 'action', async () => {
        await ContinueGame()
    }), [ContinueGame])
    const Instructions_action = React.useCallback(wrapFn(pathTo('Instructions'), 'action', async () => {
        await Instructions.Show()
    }), [Instructions])
    Elemento.elementoDebug(() => eval(Elemento.useDebugExpr()))

    return React.createElement(Page, elProps(props.path).props,
        React.createElement(Data, elProps(pathTo('Status')).display(false).props),
        React.createElement(Data, elProps(pathTo('Score')).display(false).props),
        React.createElement(Data, elProps(pathTo('RoundSkipped')).display(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundWon')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundFailed')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('WhenRoundComplete')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('IsRoundComplete')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('RoundInPlay')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('GameRunning')).show(false).props),
        React.createElement(Timer, elProps(pathTo('GameTimer')).show(false).props),
        React.createElement(Data, elProps(pathTo('MaxGuesses')).display(false).props),
        React.createElement(Data, elProps(pathTo('Word')).display(false).props),
        React.createElement(Data, elProps(pathTo('PositionsShown')).display(false).props),
        React.createElement(Data, elProps(pathTo('GapsShown')).display(false).props),
        React.createElement(Data, elProps(pathTo('LatestGuess')).display(false).props),
        React.createElement(Data, elProps(pathTo('NumberOfGuesses')).display(false).props),
        React.createElement(Calculation, elProps(pathTo('Letters')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('AllPositions')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('RemainingPositions')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('LettersShown')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('LettersShownOnly')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('LettersShownWithGaps')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('UsedAllGuesses')).show(false).props),
        React.createElement(Calculation, elProps(pathTo('ShownAllLetters')).show(false).props),
        React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).fontFamily('Chelsea Market').fontSize('28').color('#039a03').props).content('Mis_ing L_tters').props),
        React.createElement(Dialog, elProps(pathTo('Instructions')).layout('vertical').showCloseButton(true).styles(elProps(pathTo('Instructions.Styles')).padding('2em').props).props,
            React.createElement(TextElement, elProps(pathTo('InstructionsText')).allowHtml(true).content(`You have to guess words, given some of the letters.  The letters are in order, but you do not know where they come in the word (unless you show gaps).


Enter your guesses - up to three - in the box and click the Guess button.  You can also show more letters, and show the gaps in the word, but both of those reduce your points.  


Click Next Word after each word to get another one.


<b>Tips</b>
<ul>
  <li>The words may be plural</li>
</ul>

You have 3 minutes to guess as many words as you can.`).props),
            React.createElement(Button, elProps(pathTo('StartGame2')).content('Start Game').appearance('filled').show(Not(GameRunning)).action(StartGame2_action).props),
    ),
        React.createElement(Block, elProps(pathTo('StatsLayout')).layout('horizontal wrapped').styles(elProps(pathTo('StatsLayout.Styles')).fontSize('24').width('100%').justifyContent('space-between').props).props,
            React.createElement(TextElement, elProps(pathTo('ScoreDisplay')).show(Or(GameRunning, Status == 'Ended')).styles(elProps(pathTo('ScoreDisplay.Styles')).fontSize('inherit').color('blue').props).content(Score + ' points').props),
            React.createElement(TextElement, elProps(pathTo('TimeDisplay')).show(GameRunning).styles(elProps(pathTo('TimeDisplay.Styles')).fontSize('inherit').color('green').props).content(Ceiling(GameTimer. remainingTime) + 's left').props),
            React.createElement(TextElement, elProps(pathTo('GameOver')).show(Status == 'Ended').styles(elProps(pathTo('GameOver.Styles')).fontSize('inherit').color('white').backgroundColor('green').padding('0 0.5em').borderRadius('8px').props).content('Game Over').props),
    ),
        React.createElement(Block, elProps(pathTo('ReadyPanel')).layout('vertical').show(Status == 'Ready').styles(elProps(pathTo('ReadyPanel.Styles')).padding('0').props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).color('#039a03').fontFamily('Chelsea Market').fontSize('28').props).content('Welcome!').props),
            React.createElement(TextElement, elProps(pathTo('ReadyText')).styles(elProps(pathTo('ReadyText.Styles')).fontSize('20').props).content(`Guess words with letters missing.

Click Help for full details

Or Start Game to dive straight in!`).props),
    ),
        React.createElement(Block, elProps(pathTo('PlayPanel')).layout('vertical').show(Or(Status == 'Playing', Status == 'Ended')).styles(elProps(pathTo('PlayPanel.Styles')).width('100%').padding('0').position('relative').props).props,
            React.createElement(TextElement, elProps(pathTo('WordLetters')).styles(elProps(pathTo('WordLetters.Styles')).fontSize('32').letterSpacing('0.2em').props).content(If(IsRoundComplete, Word, () => Join(LettersShown))).props),
            React.createElement(Block, elProps(pathTo('RoundStatus')).layout('horizontal').styles(elProps(pathTo('RoundStatus.Styles')).justifyContent('space-between').width('20em').minHeight('1.5em').props).props,
            React.createElement(TextElement, elProps(pathTo('GuessesRemaining')).show(RoundInPlay).content((MaxGuesses - NumberOfGuesses) + ' guesses left').props),
            React.createElement(TextElement, elProps(pathTo('RoundWon')).show(IsRoundWon).content('Correct! ' + Points() + ' points added').props),
            React.createElement(TextElement, elProps(pathTo('RoundFailed')).show(IsRoundFailed).content('Sorry - ' + If(UsedAllGuesses, 'no more guesses', () => If(ShownAllLetters, 'all letters shown'))).props),
            React.createElement(TextElement, elProps(pathTo('RoundSkipped')).show(RoundSkipped).content('Skipped').props),
            React.createElement(TextElement, elProps(pathTo('PointsAvailable')).content(If(IsRoundComplete, ' ', () => Points(true) + ' points')).props),
    ),
            React.createElement(Block, elProps(pathTo('GuessEntry')).layout('horizontal wrapped').props,
            React.createElement(TextInput, elProps(pathTo('YourGuess')).label('Your Guess').readOnly(IsRoundComplete).keyAction(YourGuess_keyAction).styles(elProps(pathTo('YourGuess.Styles')).fontSize('28').width('15em').props).props),
            React.createElement(Button, elProps(pathTo('Guess')).content('Guess').appearance('outline').enabled(And(RoundInPlay, Len(YourGuess) > 0)).action(Guess_action).props),
    ),
            React.createElement(Block, elProps(pathTo('WordControls')).layout('horizontal wrapped').props,
            React.createElement(Button, elProps(pathTo('ShowAnotherLetter')).content('Show Another Letter').appearance('outline').enabled(Not(IsRoundComplete)).action(ShowAnotherLetter_action).props),
            React.createElement(Button, elProps(pathTo('ShowGaps')).content('Show Gaps').appearance('outline').enabled(Not(IsRoundComplete)).action(ShowGaps_action).props),
    ),
            React.createElement(Block, elProps(pathTo('EndofGamePanel')).layout('vertical').show(Status == 'Ended').styles(elProps(pathTo('EndofGamePanel.Styles')).position('absolute').top('50%').left('50%').translate('-50% -50%').backgroundColor('white').borderRadius('10').border('2px solid green').minWidth('18em').padding('1em').zIndex(1).props).props,
            React.createElement(TextElement, elProps(pathTo('Title')).styles(elProps(pathTo('Title.Styles')).fontFamily('fantasy').fontSize('28').color('#039a03').props).content('Congr_tulati_ns!').props),
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
        React.createElement(Block, elProps(pathTo('Spacer')).layout('vertical').styles(elProps(pathTo('Spacer.Styles')).borderBottom('2px solid lightgray').width('100%').padding('0').props).props),
        React.createElement(Block, elProps(pathTo('GameControls')).layout('horizontal').styles(elProps(pathTo('GameControls.Styles')).paddingTop('20px').props).props,
            React.createElement(Button, elProps(pathTo('StartGame')).content('Start Game').appearance('filled').show(Not(GameRunning)).action(StartGame_action).props),
            React.createElement(Button, elProps(pathTo('StopGame')).content('Stop').appearance('outline').show(GameRunning).action(StopGame_action).props),
            React.createElement(Button, elProps(pathTo('PauseGame')).content('Pause').appearance('outline').show(Status == 'Playing').action(PauseGame_action).props),
            React.createElement(Button, elProps(pathTo('ContinueGame')).content('Continue').appearance('outline').show(Status == 'Paused').action(ContinueGame_action).props),
            React.createElement(Button, elProps(pathTo('Instructions')).content('Help').appearance('outline').action(Instructions_action).props),
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
