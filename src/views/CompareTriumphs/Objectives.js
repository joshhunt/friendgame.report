import React from 'react';
import { connect } from 'react-redux';

import Icon from 'src/components/Icon';

import s from './styles.styl';

function Objective({ def, instance }) {
  return (
    <div className={s.objective}>
      <div className={instance.complete ? s.checkboxTicked : s.checkboxEmpty} />
      <div className={s.objectiveText}>
        {(def && def.progressDescription) || 'Completed'}
      </div>

      <div className={s.objectiveProgress}>
        {instance.progress}
        <span className={s.slash}> / </span>
        {instance.completionValue}
      </div>
    </div>
  );
}

function Objectives({ className, objectives, objectiveDefs }) {
  return (
    <div className={s.objectives}>
      {objectives.map(obj => {
        const def = objectiveDefs[obj.objectiveHash];
        return <Objective def={def} instance={obj} />;
      })}
    </div>
  );
}

function mapStateToProps({ definitions }) {
  return {
    objectiveDefs: definitions.DestinyObjectiveDefinition || {}
  };
}

export default connect(mapStateToProps)(Objectives);
