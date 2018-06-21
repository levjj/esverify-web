import * as React from 'react';
import { AppState } from '../app';

export interface Props {
  state: AppState;
}

export default function UserStudySurvey ({ state }: Props) {
  if (state.message) return <span>hj</span>;
  const surveyURL = 'https://docs.google.com/forms/d/e/1FAIpQLSc5zDRBb1qJ__3LDTB5mc-xaErMvPraX4X_cOzAOHAHMC1rEg';
  // viewform?usp=pp_url&entry.998982904=aaaaaaaa
  return (
    <iframe src={surveyURL + '/viewform?embedded=true&entry.998982904=aaaaaaaa'}
            width='960'
            height='820'
            frameBorder='0'
            marginHeight={0}
            marginWidth={0}>Loading...</iframe>
  );
}
