import React from 'react';
import { Avatar, Menu, Spin } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { history, connect } from 'umi';
import ChangePwd from '@/components/Authorized/ChangePwd';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

class AvatarDropdown extends React.Component {
  state = {
    modalVisible: false,
  };

  onMenuClick = (event) => {
    const { key } = event;

    if (key === 'pwd') {
      this.setState({
        modalVisible: true,
      });
      return;
    }

    if (key === 'settings') {
      history.push('/accountsettings');
      return;
    }

    if (key === 'logout') {
      const { dispatch } = this.props;
      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }
    }
  };

  getAvatarURL() {
    const { currentUser } = this.props;

    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }

      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }

    return '';
  }

  render() {
    const {
      currentUser = {
        avatar: '',
        username: '',
      },
      menu,
    } = this.props;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {menu && (
          <Menu.Item key="center">
            <UserOutlined />
            个人中心
          </Menu.Item>
        )}
        <Menu.Item key="pwd">
          <LockOutlined />
          修改密码
        </Menu.Item>
        <Menu.Item key="settings">
          <SettingOutlined />
          个人设置
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <LogoutOutlined />
          退出登录
        </Menu.Item>
      </Menu>
    );
    return currentUser && currentUser.username ? (
      <>
        <HeaderDropdown overlay={menuHeaderDropdown}>
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar size="small" className={styles.avatar} src={this.getAvatarURL()} alt="avatar" />
            <span className={`${styles.username} anticon`}>
              {currentUser.nickname || currentUser.username}
            </span>
          </span>
        </HeaderDropdown>
        <ChangePwd
          onCancel={() => this.setState({ modalVisible: false })}
          modalVisible={this.state.modalVisible}
        />
      </>
    ) : (
      <span className={`${styles.action} ${styles.account}`}>
        <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
          }}
        />
      </span>
    );
  }
}

export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(AvatarDropdown);
