import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card, CardBody,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import CustomizeFunctionOption from './CustomizeFunctionOption';

class CustomizeFunctionSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isDropdownOpen: false,
      isDropdownOpen2: false,
      isDropdownOpen3: false,
      isDropdownOpen4: false,
    };

    this.onToggleDropdown = this.onToggleDropdown.bind(this);
    this.onToggleDropdown2 = this.onToggleDropdown2.bind(this);
    this.onToggleDropdown3 = this.onToggleDropdown3.bind(this);
    this.onToggleDropdown4 = this.onToggleDropdown4.bind(this);
    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  onToggleDropdown() {
    this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
  }

  onToggleDropdown2() {
    this.setState({ isDropdownOpen2: !this.state.isDropdownOpen2 });
  }

  onToggleDropdown3() {
    this.setState({ isDropdownOpen3: !this.state.isDropdownOpen3 });
  }

  onToggleDropdown4() {
    this.setState({ isDropdownOpen4: !this.state.isDropdownOpen4 });
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeFunction();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.function') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12">
            <h2 className="admin-setting-header">{t('admin:customize_setting.function')}</h2>
            <Card className="card well my-3">
              <CardBody className="px-0 py-2">
                {t('admin:customize_setting.function_desc')}
              </CardBody>
            </Card>


            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isEnabledTimeline"
                  label={t('admin:customize_setting.function_options.timeline')}
                  isChecked={adminCustomizeContainer.state.isEnabledTimeline}
                  onChecked={() => { adminCustomizeContainer.switchEnableTimeline() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.timeline_desc1')}<br />
                    {t('admin:customize_setting.function_options.timeline_desc2')}<br />
                    {t('admin:customize_setting.function_options.timeline_desc3')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isSavedStatesOfTabChanges"
                  label={t('admin:customize_setting.function_options.tab_switch')}
                  isChecked={adminCustomizeContainer.state.isSavedStatesOfTabChanges}
                  onChecked={() => { adminCustomizeContainer.switchSavedStatesOfTabChanges() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.tab_switch_desc1')}<br />
                    {t('admin:customize_setting.function_options.tab_switch_desc2')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isEnabledAttachTitleHeader"
                  label={t('admin:customize_setting.function_options.attach_title_header')}
                  isChecked={adminCustomizeContainer.state.isEnabledAttachTitleHeader}
                  onChecked={() => { adminCustomizeContainer.switchEnabledAttachTitleHeader() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.attach_title_header_desc')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            {/* S: Modal */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_desc_in_page_contents_modal')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen4} toggle={this.onToggleDropdown4}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageListLimitForUserPage}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupSPageListLimitation(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupSPageListLimitation(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupSPageListLimitation(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.all_list_num_desc_in_page_contents_modal')}
                </p>
              </div>
            </div>

            {/* M: User Page */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_desc_in_user_page')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen} toggle={this.onToggleDropdown}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageListLimitForUserPage}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupMPageListLimitation(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupMPageListLimitation(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupMPageListLimitation(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.all_list_num_desc_in_user_page')}
                </p>
              </div>
            </div>

            {/* L: Search / Draft Pages */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_desc_in_draft_and_search_pages')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen3} toggle={this.onToggleDropdown3}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageListLimitForUserPage}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupLPageListLimitation(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupLPageListLimitation(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupLPageListLimitation(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.all_list_num_desc_in_draft_and_search_pages')}
                </p>
              </div>
            </div>

            {/* XL: NotFound / Trash Pages */}
            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <div className="my-0 w-100">
                  <label>{t('admin:customize_setting.function_options.list_num_desc_in_notfound_and_trash_pages')}</label>
                </div>
                <Dropdown isOpen={this.state.isDropdownOpen2} toggle={this.onToggleDropdown2}>
                  <DropdownToggle className="text-right col-6" caret>
                    <span className="float-left">{adminCustomizeContainer.state.pageListLimitForNotFoundAndTrashPage}</span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu" role="menu">
                    <DropdownItem key={10} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupXLPageListLimitation(10) }}>
                      <a role="menuitem">10</a>
                    </DropdownItem>
                    <DropdownItem key={30} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupXLPageListLimitation(30) }}>
                      <a role="menuitem">30</a>
                    </DropdownItem>
                    <DropdownItem key={50} role="presentation" onClick={() => { adminCustomizeContainer.switchGroupXLPageListLimitation(50) }}>
                      <a role="menuitem">50</a>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <p className="form-text text-muted">
                  {t('admin:customize_setting.function_options.all_list_num_desc_in_notfound_and_trash_pages')}
                </p>
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isEnabledStaleNotification"
                  label={t('admin:customize_setting.function_options.stale_notification')}
                  isChecked={adminCustomizeContainer.state.isEnabledStaleNotification}
                  onChecked={() => { adminCustomizeContainer.switchEnableStaleNotification() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.stale_notification_desc')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            <div className="form-group row">
              <div className="offset-md-3 col-md-6 text-left">
                <CustomizeFunctionOption
                  optionId="isAllReplyShown"
                  label={t('admin:customize_setting.function_options.show_all_reply_comments')}
                  isChecked={adminCustomizeContainer.state.isAllReplyShown || false}
                  onChecked={() => { adminCustomizeContainer.switchIsAllReplyShown() }}
                >
                  <p className="form-text text-muted">
                    {t('admin:customize_setting.function_options.show_all_reply_comments_desc')}
                  </p>
                </CustomizeFunctionOption>
              </div>
            </div>

            <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
          </div>
        </div>
      </React.Fragment>
    );
  }

}

const CustomizeFunctionSettingWrapper = withUnstatedContainers(CustomizeFunctionSetting, [AppContainer, AdminCustomizeContainer]);

CustomizeFunctionSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeFunctionSettingWrapper);
