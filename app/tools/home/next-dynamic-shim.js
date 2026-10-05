// next/dynamic outside Next: lazy-load the component, render nothing until it arrives
import React from 'react';
export default function dynamic(loader) {
  const L = React.lazy(() => loader().then(m => ({ default: m.default || m })));
  return props => React.createElement(React.Suspense, { fallback: null }, React.createElement(L, props));
}
