import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader {
    border-radius: 50%;
    border-top: 16px rgba(0,0,0,0.75) solid;
    border-left: 16px rgba(0,0,0,0.25) solid;
    border-bottom: 16px rgba(0,0,0,0.25) solid;
    border-right: 16px rgba(0,0,0,0.25) solid;
    animation: spSlices 1s infinite linear;
    width: 64px;
    height: 64px;
  }

  @keyframes spSlices {
    0% {
      border-top: 16px rgba(0,0,0,0.75) solid;
      border-right: 16px rgba(0,0,0,0.25) solid;
      border-bottom: 16px rgba(0,0,0,0.25) solid;
      border-left: 16px rgba(0,0,0,0.25) solid;
    }

    25% {
      border-top: 16px rgba(0,0,0,0.25) solid;
      border-right: 16px rgba(0,0,0,0.75) solid;
      border-bottom: 16px rgba(0,0,0,0.25) solid;
      border-left: 16px rgba(0,0,0,0.25) solid;
    }

    50% {
      border-top: 16px rgba(0,0,0,0.25) solid;
      border-right: 16px rgba(0,0,0,0.25) solid;
      border-bottom: 16px rgba(0,0,0,0.75) solid;
      border-left: 16px rgba(0,0,0,0.25) solid;
    }

    75% {
      border-top: 16px rgba(0,0,0,0.25) solid;
      border-right: 16px rgba(0,0,0,0.25) solid;
      border-bottom: 16px rgba(0,0,0,0.25) solid;
      border-left: 16px rgba(0,0,0,0.75) solid;
    }

    100% {
      border-top: 16px rgba(0,0,0,0.75) solid;
      border-right: 16px rgba(0,0,0,0.25) solid;
      border-bottom: 16px rgba(0,0,0,0.25) solid;
      border-left: 16px rgba(0,0,0,0.25) solid;
    }
  }`;

export default Loader;
