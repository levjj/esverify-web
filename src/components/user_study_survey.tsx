import * as React from 'react';
import { AppState, UserStudyState } from '../app';
import { encode } from 'base64-arraybuffer';

export interface Props {
  state: AppState;
}

function encodeTimes (state: UserStudyState): string {
  const buffer = new ArrayBuffer(8 * 3);
  const arr = new Float64Array(buffer);
  arr[0] = state.experiment1Time === undefined ? 0 : state.experiment1Time;
  arr[1] = state.experiment2Time === undefined ? 0 : state.experiment2Time;
  arr[2] = state.experiment3Time === undefined ? 0 : state.experiment3Time;
  return encode(buffer);
}

export default function UserStudySurvey ({ state }: Props) {
  if (state.message) return <span>hj</span>;
  const surveyURL = 'https://docs.google.com/forms/d/e/1FAIpQLSc5zDRBb1qJ__3LDTB5mc-xaErMvPraX4X_cOzAOHAHMC1rEg';
  // viewform?usp=pp_url&entry.998982904=aaaaaaaa
  return (
    <iframe src={surveyURL + '/viewform?embedded=true&entry.998982904=' + encodeTimes(state.userStudy)}
            width='960'
            height='820'
            frameBorder='0'
            marginHeight={0}
            marginWidth={0}>Loading...</iframe>
  );
}
