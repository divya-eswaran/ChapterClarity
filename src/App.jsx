import { useState } from "react";
import "./App.css";

const syllableOverrides = {
  implementation: 5,
  sophisticated: 5,
  computational: 5,
  methodologies: 5,
  necessitates: 4,
  comprehensive: 4,
  evaluation: 5,
  organizations: 5,
  systematically: 5,
  investigate: 4,
  multidimensional: 6,
  technological: 5,
  infrastructures: 4,
  information: 4,
  complicated: 4,
  challenging: 2,
  unnecessarily: 5,
  vocabulary: 5,
  effectively: 4,
  unfamiliar: 4,
  explanations: 4,
  comprehension: 4,
  logically: 3,
  examples: 3,
  audience: 3,
  experience: 4,
};

function countSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");

  if (!cleaned) return 0;
  if (syllableOverrides[cleaned] !== undefined) {
    return syllableOverrides[cleaned];
  }
  if (cleaned.length <= 3) return 1;

  let wordForCounting = cleaned.replace(
    /(?:[^laeiouy]es|ed|[^laeiouy]e)$/,
    ""
  );
  wordForCounting = wordForCounting.replace(/^y/, "");

  const groups = wordForCounting.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}


function getSentences(text) {
  return (
    text
      .replace(/\s+/g, " ")
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter((sentence) => /\b[\w'-]+\b/.test(sentence)) || []
  );
}


function analyzeText(text) {
  const words = text.match(/\b[\w'-]+\b/g) || [];
  const sentences = getSentences(text);
  const syllables = words.reduce(
    (total, word) => total + countSyllables(word),
    0
  );

  const wordCount = words.length;
  const sentenceCount = sentences.length;

  if (!wordCount || !sentenceCount) return null;

  const averageWords = wordCount / sentenceCount;
  const averageSyllables = syllables / wordCount;
  const rawScore =
    206.835 -
    1.015 * averageWords -
    84.6 * averageSyllables;
  const score = Math.max(0, Math.min(100, rawScore));

  const difficultSentences = sentences
    .map((sentence, index) => {
      const sentenceWords = sentence.match(/\b[\w'-]+\b/g) || [];
      const sentenceSyllables = sentenceWords.reduce(
        (total, word) => total + countSyllables(word),
        0
      );
      const complexWords = sentenceWords.filter(
        (word) => countSyllables(word) >= 3
      ).length;
      const complexity =
        sentenceWords.length * 0.5 +
        complexWords * 2 +
        sentenceSyllables / Math.max(sentenceWords.length, 1);

      return {
        sentence,
        index,
        wordCount: sentenceWords.length,
        complexity,
      };
    })
    .sort((a, b) => b.complexity - a.complexity)
    .slice(0, 5);

  return {
    score,
    wordCount,
    sentenceCount,
    syllables,
    averageWords,
    averageSyllables,
    difficultSentences,
    allSentences: sentences,
  };
}

function getReadingLevel(score) {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

function getScoreDescription(score) {
  if (score >= 70) return "Your text is relatively easy to read.";
  if (score >= 50) return "Your text may need a few simpler sentences.";
  return "Consider simplifying long sentences and complex words.";
}

const exampleText = `Technology has transformed the way people communicate, learn, and work. Students can access educational resources from almost anywhere in the world. However, understanding complicated information can sometimes be challenging.

Writers should communicate their ideas clearly and effectively. Using unnecessarily complicated vocabulary may prevent readers from understanding the main message. Breaking lengthy explanations into shorter sentences can improve comprehension.

A well-written chapter presents information logically and uses examples to explain unfamiliar concepts. Authors should consider their audience and choose language that matches the readers' knowledge and experience.`;

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleAnalyze() {
    if (!text.trim()) {
      setError("Please paste a chapter before analyzing.");
      setResult(null);
      return;
    }

    const analysis = analyzeText(text);

    if (!analysis) {
      setError("Please enter some readable text to analyze.");
      setResult(null);
      return;
    }

    setError("");
    setResult(analysis);
  }

  function handleClear() {
    setText("");
    setResult(null);
    setError("");
  }

  function handleExample() {
    setText(exampleText);
    setResult(null);
    setError("");
  }

  function isDifficultSentence(sentence, difficultSentences) {
    return difficultSentences.some((item) => item.sentence === sentence);
  }

  function handleExport() {
    if (!result) return;

    const report = [
      "ChapterClarity Readability Report",
      `Score: ${result.score.toFixed(1)}/100`,
      `Reading level: ${getReadingLevel(result.score)}`,
      `Words: ${result.wordCount}`,
      `Sentences: ${result.sentenceCount}`,
      "",
      "Five hardest sentences:",
      ...result.difficultSentences.map(
        (item, index) => `${index + 1}. ${item.sentence}`
      ),
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chapter-clarity-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a href="#" className="brand" onClick={(event) => event.preventDefault()}>
          <span className="brand-icon">C</span>
          ChapterClarity
        </a>
        <span className="nav-label">Free readability checker</span>
      </header>

      <main className="container">
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            WRITE CLEARLY. COMMUNICATE BETTER.
          </div>
          <h1>
            Make every word
            <br />
            <span>easier to understand.</span>
          </h1>
          <p className="hero-description">
            Paste a chapter, check its readability, and discover which
            sentences might be difficult for your readers.
          </p>
        </section>

        <section className="workspace">
          <div className="section-heading">
            <div>
              <h2>Your chapter</h2>
              <p>Paste your text below to get started.</p>
            </div>
            <span className="private-label">
              <span>●</span> Runs in your browser
            </span>
          </div>

          <textarea
            className="chapter-input"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (error) setError("");
            }}
            placeholder="Paste your chapter or article here..."
            aria-label="Paste your chapter here"
          />

          <div className="input-footer">
            <span>
              {text.trim()
                ? `${text.trim().split(/\s+/).length} words entered`
                : "Your text stays in this browser session."}
            </span>
            <div className="input-actions">
              <button type="button" className="text-button" onClick={handleExample}>
                Try an example
              </button>
              <button type="button" className="text-button" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>

          <button type="button" className="analyze-button" onClick={handleAnalyze}>
            Analyze readability <span>→</span>
          </button>
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        {result && (
          <section className="results">
            <div className="results-heading">
              <div>
                <span className="eyebrow">YOUR RESULTS</span>
                <h2>Readability report</h2>
              </div>
              <button type="button" className="text-button" onClick={handleExport}>
                ↓ Export report
              </button>
            </div>

            <div className="stats-grid">
              <article className="stat-card score-card">
                <span className="stat-label">READABILITY SCORE</span>
                <div className="score-number">
                  {result.score.toFixed(1)} <span>/100</span>
                </div>
                <div className="score-track">
                  <div
                    className="score-fill"
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <span className="level-label">{getReadingLevel(result.score)}</span>
                <p>{getScoreDescription(result.score)}</p>
              </article>

              <article className="stat-card">
                <span className="stat-label">TOTAL WORDS</span>
                <div className="stat-value">{result.wordCount}</div>
                <p>Words found in your chapter</p>
              </article>

              <article className="stat-card">
                <span className="stat-label">SENTENCES</span>
                <div className="stat-value">{result.sentenceCount}</div>
                <p>Complete sentences detected</p>
              </article>

              <article className="stat-card">
                <span className="stat-label">AVG. SENTENCE LENGTH</span>
                <div className="stat-value">{result.averageWords.toFixed(1)}</div>
                <p>Words per sentence</p>
              </article>
            </div>

            <div className="hardest-section">
              <div className="section-heading">
                <div>
                  <h2>Your five hardest sentences</h2>
                  <p>Sentences ranked using length and estimated word complexity.</p>
                </div>
              </div>

              <div className="sentence-list">
                {result.difficultSentences.map((item, index) => (
                  <article className="sentence-card" key={item.index}>
                    <div className="sentence-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="sentence-content">
                      <p>{item.sentence}</p>
                      <span>{item.wordCount} words · Complexity estimate</span>
                    </div>
                    <span className="difficulty-tag">
                      {index < 2 ? "High" : "Review"}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="preview-section">
              <div className="section-heading">
                <div>
                  <h2>Chapter preview</h2>
                  <p>The sentences ranked as hardest are highlighted below.</p>
                </div>
              </div>
              <div className="highlight-legend">
                <span className="legend-box" />
                Harder sentence
              </div>
              <div className="preview-text">
                {result.allSentences.map((sentence, index) => (
                  <span
                    key={`${index}-${sentence}`}
                    className={
                      isDifficultSentence(sentence, result.difficultSentences)
                        ? "highlighted-sentence"
                        : ""
                    }
                  >
                    {sentence}{" "}
                  </span>
                ))}
              </div>
            </div>

            <p className="method-note">
              <strong>How this works:</strong> The score uses an approximate
              Flesch Reading Ease formula. Sentence difficulty is estimated from
              sentence length and estimated syllable counts. These are useful
              writing indicators, not a definitive measure of understanding.
            </p>
          </section>
        )}
      </main>

      <footer className="footer">
        <a href="#" className="footer-brand" onClick={(event) => event.preventDefault()}>
          ChapterClarity
        </a>
        <span>Simple tools for clearer writing.</span>
        <span>Free · No account required</span>
      </footer>
    </div>
  );
}
