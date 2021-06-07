const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const PageSection = require(`${process.cwd()}/core/PageSection.js`);

const TalkListItem = (props) => (
  <li key={props.link}>
    <b>{props.title}</b>
      <br></br>
    <i>{props.venue}</i>
    <div>
        <a href={props.abstract}><img width="12px" src="/img/file-regular.svg"></img> Abstract</a> &nbsp;
        <a href={props.slides}><img width="15px" src="/img/desktop-solid.svg"></img> Slides</a> &nbsp;
        {props.paper === undefined ? '' : <a href={props.paper}><img width="10px" src="/img/book-solid.svg"></img> Paper &nbsp;</a>}
        <a href={props.video}><img width="18px" src="/img/youtube-brands.svg"></img> Talk Recording</a> {props.subtitles ? '(turn on subtitles)' : ''}
    </div>
    <br></br>
  </li>
);

const TalkList = (props) => <ul>{props.content.map(TalkListItem)}</ul>;

const ProjectListItem = (props) => {
  var description = '';
  if (props.description != null && props.description != '') {
    description = ' - ' + props.description;
  }

  return (
    <li>
      {props.link ? <b><a href={props.link}>{props.title}</a></b> : <b>{props.title}</b>}
      {description}
      { props.prs ?
        <table className='mtable'>
        <tr>
        <td>Rust</td>
        <td><a href="https://github.com/rust-lang/rust/pull/55734/files">Rust compiler</a></td>
        <td><a href="https://github.com/uutils/coreutils/pull/1314/files">coreutils</a></td>
        <td><a href="https://github.com/sharkdp/fd/pull/358/files">fd</a></td>
        <td><a href="https://github.com/ogham/exa/pull/435/files">exa</a></td>
        <td>Javascript</td>
        <td><a href="https://github.com/angular/angular.js/commit/362dd1786f585594de8295144dd161dc425e6676">angular.js</a></td>
        <td><a href="https://github.com/RocketChat/Rocket.Chat/pull/12346/files">Rocket.Chat</a></td>
        </tr>
        <tr>
        <td>Go</td>
        <td><a href="https://github.com/prometheus/prometheus/pull/4720/files">prometheus</a></td>
        <td><a href="https://github.com/helm/helm/pull/4757/files">helm</a></td>
        <td><a href="https://github.com/urfave/cli/pull/773/files">cli</a></td>
        <td><a href="https://github.com/rclone/rclone/pull/2638/files">rclone</a></td>
        <td>Dart</td>
        <td><a href="https://github.com/dart-lang/sdk/pull/34751/files">Dart SDK</a></td>
        <td><a href="https://github.com/tekartik/sqflite/pull/104/files">sqflite</a></td>
        </tr>
        <tr><td>Scala</td>
        <td><a href="https://github.com/scala-js/scala-js/pull/3471/files">scala-js</a></td>
        <td><a href="https://github.com/lihaoyi/Ammonite/pull/903/files">Ammonite</a></td>
        <td></td>
        <td></td>
        <td>Python</td>
        <td><a href="https://github.com/matplotlib/matplotlib/pull/12495/files">matplotlib</a></td>
        <td><a href="https://github.com/powerline/powerline/pull/1962/files">powerline</a></td>
        </tr>
        <tr>
        <td>C</td>
        <td><a href="https://github.com/php/php-src/commit/8881c3c82f75bd67578a774c40888b257a30a18f">PHP interpreter</a></td>
        <td><a href="https://github.com/radareorg/radare2/pull/12087/files">radare2</a></td>
        <td></td>
        <td></td>
        <td>Clojure</td>
        <td><a href="https://github.com/pedestal/pedestal/pull/600/files">pedestal</a></td>
        </tr>
        </table> : <div></div>
      }
    </li>
  );
};

const ProjectList = (props) => <ul>{props.content.map(ProjectListItem)}</ul>;

class Index extends React.Component {
  render() {
    return (
      <div>
        <div className="homeContainer" >
          <div className="homeSplashFade">
            <div className="wrapper homeWrapper">
              <div className="inner"> 
                <h2
                  className="projectTitle"
                  style={{maxWidth: '850px', textAlign: 'left'}}
                >
                  Projects and Talks
                </h2>
              </div>
            </div>
          </div>
          <PageSection align="center" className="featuresContainer" combyOrange>
          <div>
            <h1 id="projects">Projects</h1>
            <p>
              Comby is used for...
            </p>
            <ul>
            <li><b>Large scale refactoring</b> - Browse some small refactors merged into some of the most popular repos on GitHub for many languages.</li>
            <table className='mtable'>
            <tr>
            <td>Rust</td>
            <td><a href="https://github.com/rust-lang/rust/pull/55734/files">Rust compiler</a></td>
            <td><a href="https://github.com/uutils/coreutils/pull/1314/files">coreutils</a></td>
            <td><a href="https://github.com/sharkdp/fd/pull/358/files">fd</a></td>
            <td><a href="https://github.com/ogham/exa/pull/435/files">exa</a></td>
            <td>Javascript</td>
            <td><a href="https://github.com/angular/angular.js/commit/362dd1786f585594de8295144dd161dc425e6676">angular.js</a></td>
            <td><a href="https://github.com/RocketChat/Rocket.Chat/pull/12346/files">Rocket.Chat</a></td>
            </tr>
            <tr>
            <td>Go</td>
            <td><a href="https://github.com/prometheus/prometheus/pull/4720/files">prometheus</a></td>
            <td><a href="https://github.com/helm/helm/pull/4757/files">helm</a></td>
            <td><a href="https://github.com/urfave/cli/pull/773/files">cli</a></td>
            <td><a href="https://github.com/rclone/rclone/pull/2638/files">rclone</a></td>
            <td>Dart</td>
            <td><a href="https://github.com/dart-lang/sdk/pull/34751/files">Dart SDK</a></td>
            <td><a href="https://github.com/tekartik/sqflite/pull/104/files">sqflite</a></td>
            </tr>
            <tr><td>Scala</td>
            <td><a href="https://github.com/scala-js/scala-js/pull/3471/files">scala-js</a></td>
            <td><a href="https://github.com/lihaoyi/Ammonite/pull/903/files">Ammonite</a></td>
            <td></td>
            <td></td>
            <td>Python</td>
            <td><a href="https://github.com/matplotlib/matplotlib/pull/12495/files">matplotlib</a></td>
            <td><a href="https://github.com/powerline/powerline/pull/1962/files">powerline</a></td>
            </tr>
            <tr>
            <td>C</td>
            <td><a href="https://github.com/php/php-src/commit/8881c3c82f75bd67578a774c40888b257a30a18f">PHP interpreter</a></td>
            <td><a href="https://github.com/radareorg/radare2/pull/12087/files">radare2</a></td>
            <td></td>
            <td></td>
            <td>Clojure</td>
            <td><a href="https://github.com/pedestal/pedestal/pull/600/files">pedestal</a></td>
            </tr>
            </table>
            <p>Find more ideas for refactors in an <a href="https://catalog.comby.dev">example catalog of patterns</a>.</p>
            <li><b>Structural code search</b> - Comby is used to power <a href="https://about.sourcegraph.com/blog/going-beyond-regular-expressions-with-structural-code-search">language-aware code search at scale</a></li>
            <li><b>Fuzzing</b> - <a href="https://blog.trailofbits.com/2021/03/23/a-year-in-the-life-of-a-compiler-fuzzing-campaign/">Language-aware compiler fuzzing</a> and <a href="https://comby.dev/blog/2021/03/26/comby-reducer">test case reduction</a></li>
            <li><b>Editor find-and-replace</b> - There is an <a href="https://github.com/s-kostyaev/comby.el">Emacs package</a> and a prototype <a href="https://marketplace.visualstudio.com/items?itemName=giltho.comby-vscode">VS Code extension</a></li>
            <li><b>Academic research in software engineering</b>
            <ul><li><a href="https://2020.icse-conferences.org/details/icse-2020-papers/72/Tailoring-Programs-for-Static-Analysis-via-Program-Transformation">Suppressing analyzer false positives</a></li>
            <li><a href="http://kinneerc.github.io/assets/acsos2020.pdf">Manipulating domain-specific languages for autonomic systems</a></li>
            </ul>
            </li>
            </ul>

            <p>
              Want to share something you've used Comby for? <a href="https://github.com/comby-tools/comby.dev/edit/master/website/pages/en/projects.js">Send a PR</a>.
            </p>
          </div>
{/*
          <div>
            <h1 id="legal">Legal</h1>
            <ul>
              <li>
                <a href="/docs/legal/trademark-policy">Trademark Policy</a>
              </li>
            </ul>
            <p></p>
          </div>
*/}
          </PageSection>
        </div>
        <PageSection short>
          <div>
            <h1 id="talks">Talks</h1>
            <TalkList
              content={[
                {
                  title: 'Tailoring Programs for Static Analysis via Program Transformation',
                  venue: 'International Conference on Software Engineering, July 2020',
                  slides: '/pdfs/icse-20-tailoring-slides.pdf',
                  paper: 'https://rijnard.com/pdfs/tailoring-analysis-icse-2020.pdf',
                  video: 'https://youtu.be/GkMG2texb0c?t=5194',
                  abstract: 'https://conf.researchr.org/details/icse-2020/icse-2020-papers/72/Tailoring-Programs-for-Static-Analysis-via-Program-Transformation',
                },
                {
                  title: 'Parser Parser Combinators for Program Transformation',
                  venue: 'Strangloop, September 2019',
                  slides: '/pdfs/strangeloop-program-transformation-slides.pdf',
                  video: 'https://www.youtube.com/watch?v=JMZLBB_BFNg',
                  abstract: 'https://www.thestrangeloop.com/2019/parser-parser-combinators-for-program-transformation.html',
                },
                {
                  title: 'Bug Hunting with Structural Code Search',
                  venue: 'CactusCon, December 2019',
                  slides: '/pdfs/comby-cactuscon-2019-slides.pdf',
                  video: 'https://www.youtube.com/watch?v=yOZQsZs35FA',
                  subtitles: true,
                  abstract: 'https://www.cactuscon.com/2019-talks-and-workshops/bug-hunting-with-structural-code-search',
                },
              ]}
            />
          </div>
        </PageSection>
      </div>
    );
  }
}

Index.title = 'Projects and Talks';

module.exports = Index;
