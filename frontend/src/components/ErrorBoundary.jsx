import React from 'react';
import ErrorPage from '../pages/error/ErrorPage.jsx';

/**
 * ErrorBoundary — wraps the root app.
 * Phase III requirement #4a: "use error boundary to handle unexpected error
 * from the root component". When any child throws during render, we swap in
 * the matching ErrorPage component ("Oops, something went wrong!").
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Swap to a real logger in production
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage onGoHome={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
