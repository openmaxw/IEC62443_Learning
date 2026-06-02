import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Common';
import styles from './AppErrorBoundary.module.css';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Route-level error boundary caught an error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.page}>
          <div className={styles.card}>
            <span className={styles.eyebrow}>系统保护已触发</span>
            <h1>当前页面发生错误，已阻止整页白屏。</h1>
            <p>你可以返回项目总览、刷新页面，或先初始化项目后重试。如果问题持续出现，请保留当前操作路径用于排查。</p>
            <div className={styles.actions}>
              <Link to="/dashboard"><Button variant="primary" size="medium">返回项目总览</Button></Link>
              <Button variant="secondary" size="medium" onClick={this.handleReload}>刷新页面</Button>
            </div>
            <div className={styles.meta}>
              <strong>错误摘要</strong>
              <span>{this.state.error?.message || '未知错误'}</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
