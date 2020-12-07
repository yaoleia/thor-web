import { Steps, Button, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import PageHeader from '@/components/PageHeader';
import styles from './style.less';

const { Step } = Steps;

const steps = [
  {
    title: '数据',
  },
  {
    title: '训练',
  },
  {
    title: '评估',
  },
];

const ProjectWorkplace = ({ location: { query = {} }, currentUser }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // const { pid } = query;
    // if (pid) {
    //   document.title = `工作台 - ${pid}`;
    //   return;
    // }
    // history.push('/runtime');
  }, []);

  if (!currentUser || !currentUser.username) {
    return null;
  }

  return (
    <div>
      <PageHeader
        name={`当前项目: ${query.pid || ''}`}
        extra={
          <div className="steps-action">
            {current > 0 && (
              <Button
                style={{
                  marginRight: 10,
                }}
                onClick={() => setCurrent(current - 1)}
              >
                上一步
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => setCurrent(current + 1)}>
                下一步
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={() => message.success('模型已保存!')}>
                保存模型
              </Button>
            )}
          </div>
        }
      />
      <Steps current={current} className={styles.stepContainer}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
    </div>
  );
};

export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(ProjectWorkplace);
