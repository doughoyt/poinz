import React, {useCallback, useState, useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {useDropzone} from 'react-dropzone';

import {importCsvFile} from '../../state/actions/commandActions';
import {getActiveStories} from '../../state/selectors/storiesAndEstimates';
import StoryEditForm from './StoryEditForm';
import Story from './Story';
import BacklogSortForm, {defaultSorting} from './BacklogSortForm';

import {
  StyledStories,
  StyledFileImportDropZone,
  StyledFileImportDropZoneOverlay,
  StyledBacklogInfoText
} from './_styled';

const sortAndFilterStories = (activeStories, comparator, query) => {
  const lcQuery = query.toLowerCase();
  let shallowCopy = query
    ? [...activeStories.filter((s) => s.title.toLowerCase().includes(lcQuery))]
    : [...activeStories];
  return shallowCopy.sort(comparator);
};

/**
 * csv file drag'n'drop for story import
 * @param {function} onFilesDrop
 * @return {{isDragAccept, getRootProps, isDragActive, isDragReject}}
 */
const useDrop = (onFilesDrop) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFilesDrop(acceptedFiles[0]);
    }
  }, []);
  const {getRootProps, isDragActive, isDragAccept, isDragReject} = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    maxSize: 200000,
    accept:
      'text/csv, application/vnd.ms-excel, application/csv, text/x-csv, application/x-csv, text/comma-separated-values, text/x-comma-separated-values'
  });

  return {getRootProps, isDragActive, isDragAccept, isDragReject};
};

/**
 * @param activeStories
 * @return {{setSorting, setFilterQuery, sorting, sortedStories, filterQuery}}
 */
const useSortingAndFiltering = (activeStories) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sorting, setSorting] = useState(defaultSorting);
  const [sortedStories, setSortedStories] = useState(activeStories);
  useEffect(() => {
    setSortedStories(sortAndFilterStories(activeStories, sorting.comp, filterQuery));
  }, [activeStories, sorting, filterQuery]);

  return {filterQuery, setFilterQuery, sorting, setSorting, sortedStories};
};

/**
 *
 * @param selectedStoryId
 * @param activeStories
 * @return {{highlightedStoryId, setHighlightedStoryId}}
 */
const useHighlightedStory = (selectedStoryId, activeStories) => {
  const [highlightedStoryId, setHighlightedStoryId] = useState(selectedStoryId);
  useEffect(() => {
    if (!highlightedStoryId || !activeStories.find((s) => s.id === highlightedStoryId)) {
      setHighlightedStoryId(selectedStoryId);
    }
  }, [selectedStoryId, activeStories]);

  return {highlightedStoryId, setHighlightedStoryId};
};

/**
 * List of active stories. Accepts drops of csv files for importing stories. Provides means to filter and sort active stories.
 */
const BacklogActive = ({t, activeStories, selectedStoryId, importCsvFile}) => {
  const hasActiveStories = activeStories.length > 0;

  const {highlightedStoryId, setHighlightedStoryId} = useHighlightedStory(
    selectedStoryId,
    activeStories
  );

  const {filterQuery, setFilterQuery, sorting, setSorting, sortedStories} = useSortingAndFiltering(
    activeStories
  );

  const {getRootProps, isDragActive, isDragAccept, isDragReject} = useDrop(importCsvFile);

  return (
    <StyledFileImportDropZone {...getRootProps()}>
      <StyledFileImportDropZoneOverlay
        active={isDragActive}
        isAccept={isDragAccept}
        isReject={isDragReject}
      />

      {hasActiveStories && (
        <React.Fragment>
          {activeStories.length > 1 && (
            <BacklogSortForm
              onSortingChanged={setSorting}
              sorting={sorting}
              onQueryChanged={setFilterQuery}
              filterQuery={filterQuery}
            />
          )}

          <StyledStories data-testid="activeStories">
            {sortedStories.map((story) =>
              story.editMode ? (
                <StoryEditForm key={story.id} story={story} />
              ) : (
                <Story
                  key={story.id}
                  story={story}
                  isHighlighted={story.id === highlightedStoryId}
                  onStoryClicked={() => setHighlightedStoryId(story.id)}
                />
              )
            )}
          </StyledStories>
        </React.Fragment>
      )}

      {!hasActiveStories && <StyledBacklogInfoText>{t('noActiveStories')}</StyledBacklogInfoText>}
    </StyledFileImportDropZone>
  );
};

BacklogActive.propTypes = {
  t: PropTypes.func.isRequired,
  activeStories: PropTypes.array,
  selectedStoryId: PropTypes.string,
  importCsvFile: PropTypes.func.isRequired
};

export default connect(
  (state) => ({
    t: state.translator,
    activeStories: getActiveStories(state),
    selectedStoryId: state.selectedStory
  }),
  {importCsvFile}
)(BacklogActive);
