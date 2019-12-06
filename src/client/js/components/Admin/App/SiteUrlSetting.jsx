import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class SiteUrlSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      siteUrl: '',
    };

    this.inputSiteUrlChangeHandler = this.inputSiteUrlChangeHandler.bind(this);
  }

  inputSiteUrlChangeHandler(event) {
    this.setState({ siteUrl: event.target.value });
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <p className="well">{t('app_setting.Site URL desc')}</p>
        {/* {% if !getConfig('crowi', 'app:siteUrl') %}
              <p class="alert alert-danger"><i class="icon-exclamation"></i> {{ t('app_setting.Site URL warn') }}</p>
        {% endif %} */}

        <div className="row">
          <div className="col-md-12">
            <div className="col-xs-offset-3">
              <table className="table settings-table">
                <colgroup>
                  <col className="from-db" />
                  <col className="from-env-vars" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Database</th>
                    <th>Environment variables</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input
                        className="form-control"
                        type="text"
                        name="settingForm[app:siteUrl]"
                        value={this.state.siteUrl}
                        onChange={this.inputSiteUrlChangeHandler}
                        placeholder="e.g. https://my.growi.org"
                      />
                      <p className="help-block">
                        {/* eslint-disable-next-line react/no-danger */}
                        <div dangerouslySetInnerHTML={{ __html: t('app_setting.siteurl_help') }} />
                      </p>
                    </td>
                    <td>
                      <input className="form-control" type="text" value="{{ getConfigFromEnvVars('crowi', 'app:siteUrl') | default('') }}" readOnly />
                      <p className="help-block">
                        {/* eslint-disable-next-line react/no-danger */}
                        <div dangerouslySetInnerHTML={{ __html: t('app_setting.Use env var if empty', { variable: 'APP_SITE_URL' }) }} />
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                <button type="submit" className="btn btn-primary">
                  { t('app_setting.Update') }
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SiteUrlSettingWrapper = (props) => {
  return createSubscribedElement(SiteUrlSetting, props, [AppContainer]);
};

SiteUrlSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(SiteUrlSettingWrapper);
