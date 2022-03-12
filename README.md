# Spellchecker

This is a model of a spell checker that works with 80-90% accuracy. This is an implementation from [Peter Novig's](http://www.norvig.com/spell-correct.html) whitepaper he wrote. This is a re-implementation to learn some techniques of how a spell checker works.

## Running
```
node spellcheck.js [incorrectWrd]
```

## How it works

### Step 1 - Generate alternatives that are 1 edit way
We generate a bunch of possible alternatives by applying 4 different operations on the word. These operations are all one change away.
1. Insertion
    - We insert each letter of the alphabet at each possible position in the word
        ```
        given word = tst
        possible alternatives: ['atst', 'btst', ..., 'tast', 'tbst', ..., 'test']
        ```

2. Deletion
    - We delete each letter to see if there was extra letter added
        ```
        given word = testj
        possible alternatives: ['estj', 'tstj', 'tetj', 'test']
        ```
3. Replacement
    - We replace each letter of the given word with every letter of the alphabet to see if a wrong letter was typed instead
        ```
        given word = tezt
        possible alternatives: ['aezt', 'bezt', 'cezt', ..., 'teqt', 'tert', 'test']
        ```
4. Transposition
    - We swap two letters that are next to each other in case you were typing too fast
        ```
        given word = tets
        possible alternatives: ['etts', 'ttes', 'test']
        ```
    
### Step 2 - Generate alternatives that are 2 edits way
Same concept as before. We check for alternatives that are two edits away. This improves the accuracy somewhat because we can't always assume all typos will only have one mistake.
```
given word = teztt
possible alternatives: ['test']
```

### Step 3 - Filter out unknown words
In the directory is a file called `big.txt` which contains [public domains book excepts](http://www.gutenberg.org/wiki/Main_Page) and lists of the most frequent words in English. 

Since there are so many alternatives generated from Step's 1 and 2. We filter out all words we don't know.

### Step 4 - Pick out the best word from all of the possibilities
After the previous steps, we might have a list of alternative words that look something like this:
```
[wordItselfIfReal, edits1Alternatives, edits2Alternatives]
```

To simplify our model and save us a lot of time. We weight `wordItselfIfReal` infinitely greater than `edits1Alternatives`. Similarly we weight `edits1Alternatives` infinitely greater than `edits2Alternatives`. Using this weighting system we can get:
```
wordItselfIfReal > edits1Alternatives > edits2Alternatives > wordIfSpeltWrong
```

After we weight the words correctly, we might end up with more than one possible word. For example if we type in `thew` (_the_ with an extra letter), we will get two possible words: `['the', 'thaw']`. We now need to make a decision about which word the user probably meant to type in.

Again, we make forego some complexity in the calculation to make our lives easier. If we again look at `big.txt`, it contains exerts from popular books. Since this is real text, it contains real examples of how words are used. To make the decision about which word to choose, we rank the probability that each word will come up and return back the highest probability. 

This probability is calculated by counting the occurrence of the word and dividing it by the count of all words
```
words: ['the', 'thaw']
probability: ['the': 0.07, 'thaw': 0.0000017]
```