const fs = require("fs");
const collections = require("pycollections");

const words = (text) => text.toLowerCase().match(/\w+/g);

const WORDS = new collections.Counter(words(fs.readFileSync("big.txt", "utf-8")));
const WORD_COUNT = WORDS.items().reduce((partialSum, a) => partialSum + a[1], 0);

const P = (word) => WORDS.get(word) / WORD_COUNT;

const correction = (word) => {
    let maxP = 0;
    let correction = {};
    candidates(word).map((x) => {
        let probability = P(x);
        if (probability > maxP) {
            maxP = probability;
            correction = x;
        }
    });

    return correction;
};

const candidates = (word) => {
    let wordKnown = known([word]);
    if (wordKnown.length) return wordKnown;

    let edits1Away = known(edits1(word));
    if (edits1Away.length) return edits1Away;

    let edits2Away = known(edits2(word));
    if (edits2Away.length) return edits2Away;

    console.log("No alternatives");
    return [word];
};

const known = (words) => words.filter((x) => WORDS.get(x) > 0);

const edits1 = (word) => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    const splits = Array(word.length + 1)
        .fill()
        .map((_, i) => [word.slice(0, i), word.slice(i, word.length)]);
    const insertion = [...letters].map((letter) => splits.map(([L, R]) => L + letter + R)).flat();
    const deletion = splits.map(([L, R]) => R && L + R.slice(1));
    const replace = [...letters].map((letter) => splits.map(([L, R]) => R && L + letter + R.slice(1))).flat();
    const transposition = splits.map(([L, R]) => (R.length > 1 ? L + R[1] + R[0] + R.slice(2) : ""));

    return [...new Set([...insertion, ...deletion, ...replace, ...transposition])];
};

const edits2 = (word) =>
    [
        ...new Set(
            edits1(word)
                .map((x) => edits1(x))
                .flat()
        ),
    ].filter((x) => x.length > 1);

const word = process.argv[2];
console.log(correction(word));
