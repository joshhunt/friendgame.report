import React from 'react';
import { connect } from 'react-redux';

import Icon from 'src/components/Icon';

import s from './styles.styl';

function Objective({ className, objectives, objectiveDefs }) {
  return (
    <div className={s.objectives}>
      {objectives.map(obj => {
        const def = objectiveDefs[obj.objectiveHash];
        return (
          <div>
            <input type="checkbox" checked={obj.complete} disabled />
            {/* <div className={obj.complete ? s.checkboxTicked : s.checkboxEmpty}> */}
            {/*   {obj.complete ? ( */}
            {/*     <Icon className={s.icon} name="times" /> */}
            {/*   ) : ( */}
            {/*     <Icon className={s.icon} name="check" /> */}
            {/*   )} */}
            {/* </div> */}
            {(def && def.progressDescription) || 'Completed'}{' '}
          </div>
        );
      })}
    </div>
  );
}

function mapStateToProps({ definitions }) {
  return {
    objectiveDefs: definitions.DestinyObjectiveDefinition || {}
  };
}

export default connect(mapStateToProps)(Objective);
