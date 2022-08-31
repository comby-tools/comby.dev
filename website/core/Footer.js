const React = require('react');

class Footer extends React.Component {
  render() {
    const {config: siteConfig} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${doc}`;
    return (
      <footer className="nav-footer" id="footer">
        <div className="wrapper">
          <p className="footer">
            © 2022 <a href="https://twitter.com/rvtond">@rvtond</a>{' · '}
            <a href={docUrl('get-started')}>Get started</a>
            {' · '}
            <a href={docUrl('overview')}>Docs</a>
            {' · '}
            <a href={`${baseUrl}projects`}>Projects & Talks</a>
            {' · '}
            <a href={`${baseUrl}blog`}>Blog</a>
            {' · '}
            <a href="https://twitter.com/rvtond">Twitter</a>
          </p>
        </div>
      </footer>
    );
  }
}

module.exports = Footer;
