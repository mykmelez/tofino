/*
Copyright 2016 Mozilla

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
*/

import React, { PropTypes, Component } from 'react';

import Style from '../../browser-style';
import Btn from './btn';

import { fixURL, getCurrentWebView } from '../../browser-util';

const LOCATION_BAR_STYLE = Style.registerStyle({
  flex: 1,
  alignItems: 'center',
  overflow: 'hidden',
  padding: '0 10px',
  backgroundColor: '#fff',
  borderRadius: '2px',
  border: '1px solid',
  transition: `margin 0.3s ease-in-out,
               border-color 0.3s ease-in-out`,

  WebkitAppRegion: 'no-drag',
});

const LOCATION_BAR_EXPANDED_STYLE = Style.registerStyle({
  margin: '12px 4vw',
  borderColor: '#e5e5e5',

  '@media (max-width: 1024px)': {
    margin: '12px 0',
  },
});

const LOCATION_BAR_COLLAPSED_STYLE = Style.registerStyle({
  margin: '0 4vw',
  borderColor: 'transparent',

  '@media (max-width: 1024px)': {
    margin: '12px 0',
  },
});

const LOCATION_BAR_BUTTONS_STYLE = Style.registerStyle({
  margin: '0 3px',
});

const TITLE_BAR_STYLE = Style.registerStyle({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  '*': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const INPUT_BAR_STYLE = Style.registerStyle({
  flex: 1,
  overflow: 'hidden',
  border: 'none',
});

/**
 * The URL / location bar.
 * This needs to be a heavyweight component because we need to add listeners
 * to ipcRenderer on mount, and because the key-down event handler is non
 * trivial.
 */
class Location extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showURLBar: false,
    };

    this.handleTitleClick = this.handleTitleClick.bind(this);
    this.handleTitleFocus = this.handleTitleFocus.bind(this);
    this.handleURLBarFocus = this.handleURLBarFocus.bind(this);
    this.handleURLBarBlur = this.handleURLBarBlur.bind(this);
    this.handleURLBarKeyDown = this.handleURLBarKeyDown.bind(this);
    this.toggleBookmark = this.toggleBookmark.bind(this);
  }

  componentDidMount() {
    this.props.ipcRenderer.on('focus-urlbar', () => this.refs.input.select());
  }

  componentDidUpdate() {
    // If we're showing the URL bar, it should be focused. The scenario
    // where this isn't true is immediately after displaying the URL bar,
    // so give it focus.
    if (this.state.showURLBar && document.activeElement !== this.refs.input) {
      this.refs.input.focus();
    }
  }

  getBookmarkIcon() {
    const { page, isBookmarked } = this.props;
    if (page.isLoading) {
      return 'glyph-bookmark-unknown-16.svg';
    }
    if (isBookmarked(page.location)) {
      return 'glyph-bookmark-filled-16.svg';
    }
    return 'glyph-bookmark-hollow-16.svg';
  }

  toggleBookmark(e) {
    const { isBookmarked, bookmark, unbookmark } = this.props;
    const webview = getCurrentWebView(e.target.ownerDocument);
    const title = webview.getTitle();
    const url = webview.getURL();
    if (isBookmarked(url)) {
      unbookmark(url);
    } else {
      bookmark(title, url);
    }
  }

  handleTitleClick() {
    this.setState({ showURLBar: true });
  }

  handleTitleFocus() {
    this.setState({ showURLBar: true });
  }

  handleURLBarFocus() {
    this.refs.input.select();
  }

  handleURLBarBlur() {
    this.setState({ showURLBar: false });
  }

  handleURLBarKeyDown(ev) {
    if (ev.keyCode === 13) { // enter
      this.props.navigateTo(fixURL(ev.target.value));
    } else if (ev.keyCode === 27) { // esc
      this.props.onLocationReset();
      ev.target.select();
    }
  }

  render() {
    return (
      <div id="browser-location-bar"
        className={`${LOCATION_BAR_STYLE} ${this.props.page.chromeMode === 'expanded'
          ? LOCATION_BAR_EXPANDED_STYLE
          : LOCATION_BAR_COLLAPSED_STYLE}`}>
        <Btn title="Info"
          className={LOCATION_BAR_BUTTONS_STYLE}
          image=""
          clickHandler={() => {}} />
        <div id="browser-location-title-bar"
          className={TITLE_BAR_STYLE}
          hidden={this.state.showURLBar}
          tabIndex={0}
          onClick={this.handleTitleClick}
          onFocus={this.handleTitleFocus}>
          <span>
            {this.props.page.title}
          </span>
        </div>
        <input id="urlbar-input"
          className={INPUT_BAR_STYLE}
          hidden={!this.state.showURLBar}
          type="text"
          ref="input"
          defaultValue={this.props.page.userTyped !== null
            ? this.props.page.userTyped
            : this.props.page.location}
          onFocus={this.handleURLBarFocus}
          onBlur={this.handleURLBarBlur}
          onChange={this.props.onLocationChange}
          onKeyDown={this.handleURLBarKeyDown}
          onContextMenu={this.props.onLocationContextMenu} />
        <Btn title="Bookmark"
          className={LOCATION_BAR_BUTTONS_STYLE}
          image={this.getBookmarkIcon()}
          disabled={this.props.page.isLoading}
          clickHandler={this.toggleBookmark} />
      </div>
    );
  }
}

Location.propTypes = {
  page: PropTypes.object.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  onLocationContextMenu: PropTypes.func.isRequired,
  onLocationReset: PropTypes.func.isRequired,
  isBookmarked: PropTypes.func.isRequired,
  bookmark: PropTypes.func.isRequired,
  unbookmark: PropTypes.func.isRequired,
  ipcRenderer: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

export default Location;
