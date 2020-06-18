const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */

const PageSection = require(`${process.cwd()}/core/PageSection.js`);

const searchQuery = `
\`\`\`
repogroup:go-gh-100 -file:vendor errors.New(fmt.Sprintf(:[_]))
\`\`\`
`;

const searchExample = `
\`\`\`patch
@@ -72,7 +72,7 @@
 func listGroups(*User) ([]string, error) {
     if runtime.GOOS == "android" || runtime.GOOS == "aix" {
-        return nil, errors.New(fmt.Sprintf("user: GroupIds not implemented on %s", runtime.GOOS))
+        return nil, fmt.Errorf("user: GroupIds not implemented on %s", runtime.GOOS)
     }
     return nil, errors.New("user: GroupIds requires cgo")
 }
\`\`\`
`;

const Button = (props) => (
  <a
    className="button"
    style={{marginRight: '10px', marginBottom: '10px', paddingLeft: '100px', paddingRight: '100px', paddingTop: '35px', paddingBottom: '35px', fontSize: '17px'}}
    href={props.href}
    target={props.target}
  >
    {props.children}
  </a>
);

class Redirect extends React.Component {
    render () {
        return (
            <div>
              <PageSection>
                <p>By clicking below, you'll be redirected to <a href="https://about.sourcegraph.com">Sourcegraph</a> where you can search popular GitHub repositories using Comby.</p>
                <p>A preloaded example searches the top 100 most popular Go projects on GitHub (by stars). The pattern searches for matches of <code>errors.New(fmt.Sprintf(...))</code> that can be changed to the <a href="https://github.com/golang/go/commit/3507551a1f0d34d567d77242b68bf19b00caf9b7">preferred form</a> <code>fmt.Errorf(...)</code>.</p>
                <p>Search other languages by changing the <code>repogroup</code> in the query to <code>&lt;lang&gt;-gh-100</code> like <code>c#-gh-100</code> or <code>javascript-gh-100</code>.</p>
                {/*<MarkdownBlock>{searchExample}</MarkdownBlock>*/}
                <div className="productShowcaseSection">
                  <div style={{paddingTop: '1.2em'}}>
                    <Button href="https://sourcegraph.com/search?q=repogroup:go-gh-100+-file:vendor+errors.New%28fmt.Sprintf%28:%5B_%5D%29%29&patternType=structural">Take me there ↗</Button>
                  </div>
                </div>
              </PageSection>
            </div>
        );
    }
}

module.exports = Redirect;
