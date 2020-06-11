/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const PageSection = require(`${process.cwd()}/core/PageSection.js`);

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

/* https://sourcegraphcom/github.com/TarrySingh/Artificial-Intelligence-Deep-Learning-Machine-Learning-Tutorials@db4efbb92cbfd6fa2076d2e881853f2382986da2/-/blob/java/java2py/antlr-3.1.3/runtime/Python/tests/t042ast.py?subtree=true */
/* https://docs.python.org/2/library/2to3.html */
const mainExample = `
\`\`\`bash
comby 'failUnlessEqual(:[a],:[b])' 'assertEqual(:[a],:[b])' example.py
\`\`\`
`;

const patchExample = `
\`\`\`patch
--- example.py
+++ example.py
@@ -1,6 +1,6 @@
     def test(self):
         r = self.parse("if 1 fooze", 'r3')
-        self.failUnlessEqual(
+        self.assertEqual(
             r.tree.toStringTree(),
             '(if 1 fooze)'
             )
\`\`\`
`;


const Button = (props) => (
  <a
    className="button"
    style={{marginRight: '10px', marginBottom: '10px'}}
    href={props.href}
    target={props.target}
  >
    {props.children}
  </a>
);

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const showcase = siteConfig.users.map((user) => (
      <a className="link" href={user.infoLink} key={user.infoLink}>
        <img
          src={`${baseUrl}${user.image}`}
          alt={user.caption}
          title={user.caption}
        />
        <span className="caption">{user.caption}</span>
      </a>
    ));

    return (
      <div>
        <div className="homeContainer">
          <div className="homeSplashFade">
            <div className="wrapper homeWrapper">
              <div className="projectLogo">
                <img
                  src={`${baseUrl}img/comby-logo.svg`}
                  alt="Comby Logo"
                />
              </div>
              <div className="inner">
                <h2
                  className="projectTitle"
                  style={{maxWidth: '850px', textAlign: 'left'}}
                >
                  Comby is a tool for searching and changing code structure
                </h2>
                <p style={{paddingTop: '1em'}}>
                </p>
                <div style={{paddingTop: '1.2em'}}>
                  <Button href={docUrl('get-started')}>Get started</Button>
                </div>
              </div>
            </div>
          </div>
          <Container align="center" className="featuresContainer">
            <GridBlock
              align="left"
              layout="twoColumn"
              contents={[
                {
                  title: 'General and lightweight',
                  content:
                    'Use lightweight templates to easily search and change code, HTML, or JSON. Comby is designed to work on any language or data format.\n\n[Read the docs →](docs/overview)',
                },
                {
                  title: 'Language-aware',
                  content:
                    "Perform richer search and replace because Comby understands the syntax of code blocks, strings, and comments for your language.\n\n[Install and try →](docs/get-started)",
                },
                  {/*
                {
                  title: 'Fast',
                  content:
                    'Comby actually parses your program, so it does more work than tools like grep. It is still very fast, and outpaces other parser-based tools.\n\n[Compare Comby to related tools →](docs/compare-TODO)',
                },
                */}
              ]}
            />
          </Container>
        </div>
        <PageSection gray>
          <h2>Find and refactor</h2>
          <div className="row">
            <div className="columnOneThird">
              <p>
            Comby is ideal for touching up pieces of code. Use it to translate code like this Python 2 to 3 fixer on the right to replace deprecated methods. Or, easily write one-off refactors or a collection of quickfixes customized to your project.  Comby makes finding and changing code easier than regex alone allows and avoids pitfalls like escaping parentheses, quotes, or multiline changes.
            </p>
            </div>
            <div className="columnTwoThirds">
              <MarkdownBlock>{mainExample}</MarkdownBlock>
              <MarkdownBlock>{patchExample}</MarkdownBlock>
              <a style={{float: 'right', fontSize: 12 + 'px'}} href="https://docs.python.org/3/library/2to3.html#fixers">Python 2 to 3 fixers reference↗</a>
            {/* [example](https://bit.ly/3e1hMgG */}
            </div>
          </div>
        </PageSection>
        <PageSection>
          <h2>Designed to work in the large and in the small</h2>
          <div className="row">
            <div className="column">
              <p>
            Comby can execute large-scale code changes or let you do an interactive review like <a href="https://github.com/facebook/codemod">codemod</a>.
Comby is designed to support <a href="docs/overview#does-it-work-on-my-language">every language</a>, and not just the popular ones.
              </p>
            </div>
            <div className="column">
              <p>
 Dedicated parsers refine how Comby understands code, but it also has basic out-of-the-box support for data formats like JSON, recent languages like <a href="https://ziglang.org/">Zig</a>, or your own DSLs!
              </p>
            </div>
          </div>
<video id="background-video" style={{width: '100%', marginTop: '0.5em', borderRadius: '5px'}} loop autoPlay>
    <source  src={`${baseUrl}img/comby-errorf.mp4`} type="video/mp4" />
    <source src={`${baseUrl}img/comby-errorf.mp4`} type="video/ogg" />
    Your browser does not support the video tag.
</video>
        </PageSection>
        <PageSection gray>
          <div className="productShowcaseSection">
            <h2>How is Comby used today?</h2>
            <p>
              Comby is used in everyday developer workflows and academic research.
            </p>
            <div className="logos">{showcase}</div>
            <p>
              Have you used Comby in one of your projects or have something to share? Point us to your commit or  <a href="https://github.com/comby-tools/comby.dev/edit/master/website/siteConfig.js">open a PR</a> and get your project featured here.{' '}<br></br>
            </p>
          </div>
        </PageSection>
        <PageSection>
          <h2>Parser Parser Combinators for Program Transformation</h2>
          <div className="row">
            <div className="column">
              <a href="https://www.youtube.com/watch?v=JMZLBB_BFNg&feature=emb_title">
                <img
                  src={`${baseUrl}img/strangeloop-thumb.png`}
                  alt="Link to Comby Strang Loop video"
                  style={{width: '100%', maxWidth: '850px', marginTop: '0.5em'}}
                />
              </a>
            </div>
            <div className="column">
              <p>
                Watch the <a href="docs/talks/strange-loop-2018">Strange Loop talk</a> to learn more about Comby.
              </p>
              <blockquote className="monotone">
                <p>
                  This talk shares the core ideas and motivation behind Comby, and example uses and applications.
                </p>
                <p>
                Mini abstract: Regex-based search-and-replace falls short of recognizing program syntax that so often correspond to expressions in code. Many approaches and tools that tackle the problem to overcome the limitations of regex matching but remain underdeveloped for easily <i>changing</i> code. Expressive and powerful transformation frameworks, however, can be hard to learn or use. Comby fills a gap by focusing on lightweight program transformation in every language for every programmer.
                </p>
              </blockquote>
            </div>
          </div>
        </PageSection>
      </div>
    );
  }
}

module.exports = Index;
