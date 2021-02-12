import React from 'react';
import {connect} from 'react-redux';
import Anchorify from 'react-anchorify-text';
import PropTypes from 'prop-types';

import {editStory} from '../../state/actions/uiStateActions';
import {selectStory, trashStory} from '../../state/actions/commandActions';
import {isThisStoryWaiting} from '../../state/selectors/pendingCommands';
import ConsensusBadge from '../common/ConsensusBadge';

import {
  StyledStoryToolbar,
  StyledStory,
  StyledStoryText,
  StyledHighlightButtonWrapper
} from './_styled';
import {StyledStoryTitle} from '../_styled';
import {hasStoryConsensus} from '../../state/selectors/storiesAndEstimates';

/**
 * One story in the backlog
 */
const Story = ({
  t,
  story,
  isHighlighted,
  onStoryClicked,
  selectedStoryId,
  selectStory,
  editStory,
  trashStory,
  isWaiting
}) => {
  const isSelected = selectedStoryId === story.id;
  const hasConsensus = hasStoryConsensus(story);

  return (
    <StyledStory
      id={'story.' + story.id}
      data-testid={isSelected ? 'storySelected' : 'story'}
      onClick={onStoryClicked}
      selected={isSelected}
      className={isWaiting ? 'waiting-spinner' : ''}
    >
      <StyledStoryToolbar>
        <i
          className="icon-pencil story-edit"
          onClick={triggerEdit}
          data-testid="editStoryButton"
          title={t('edit')}
        />
        <i
          className="icon-trash story-trash"
          onClick={triggerTrash}
          data-testid="trashStoryButton"
          title={t('trash')}
        />
      </StyledStoryToolbar>

      <StyledStoryTitle>
        <div>{story.title}</div>
        {hasConsensus && <ConsensusBadge consensusValue={story.consensus} />}
      </StyledStoryTitle>

      {
        // only display story text for highlighted story. improves overall readibility / usability (see #24)
        isHighlighted && (
          <StyledStoryText data-testid="storyText">
            <Anchorify text={story.description || ''} />
          </StyledStoryText>
        )
      }
      {isHighlighted && !isSelected && (
        <StyledHighlightButtonWrapper>
          <button
            type="button"
            className="pure-button pure-button-primary"
            data-testid="selectButton"
            onClick={triggerSelect}
            title={t('estimateStoryHint')}
          >
            {t('estimateStory')} <i className="icon-right-hand button-icon-right"></i>
          </button>
        </StyledHighlightButtonWrapper>
      )}
    </StyledStory>
  );

  function triggerSelect() {
    selectStory(story.id);
  }

  function triggerEdit(e) {
    e.stopPropagation(); // make sure to stop bubbling up. we do not want to trigger story select
    editStory(story.id);
  }

  function triggerTrash(e) {
    e.stopPropagation(); // make sure to stop bubbling up. we do not want to trigger story select
    trashStory(story.id);
  }
};

Story.propTypes = {
  story: PropTypes.object,
  isWaiting: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  selectedStoryId: PropTypes.string,
  onStoryClicked: PropTypes.func,
  selectStory: PropTypes.func,
  editStory: PropTypes.func,
  trashStory: PropTypes.func,
  t: PropTypes.func
};

export default connect(
  (state, props) => ({
    t: state.translator,
    selectedStoryId: state.selectedStory,
    isWaiting: isThisStoryWaiting(state, props.story.id)
  }),
  {selectStory, editStory, trashStory}
)(Story);
