/**
 * NOTE: !!!!!
 * when retrieving the selection from FlexSelect which is an object (map), where the keys are the id's of the flex-select elements. if you use Object.keys(selection) then the resulting array will contain the id's as string! if you need them as integer do the following Object.keys(selection).map(id => parseInd(id)) !!!!!!!!
 * 
 */

import React, { PureComponent } from "react";

import './styles.scss';

import classNames from 'classnames'

class FlexSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selection: {}
        }
        
        const { getResetSelectionMethod, getSetSelectionMethod } = this.props;

        if (typeof getResetSelectionMethod === 'function') getResetSelectionMethod(this.resetSelection)
        if (typeof getSetSelectionMethod === 'function') getSetSelectionMethod(this.setSelection);
    }


    setSelection = (selection) => {
        return new Promise(resolve => {
            this.setState({
                selection: {
                    ...selection
                }
            }, () => {
                resolve(selection)
            })
        });
    }

    resetSelection = () => {
        const { onSelectionChange } = this.props;
        return new Promise(resolve => {
            this.setState({
                selection: {}
            }, () => {
                onSelectionChange({});
                resolve();
            });
        });
    }

    onElClick = (selectionId, evt) => {
        const { onElClick, onSelect, onUnselect, multiple, metaData, onSelectionChange, disabled } = this.props;
        
        // console.log("%cflex select on click ====", "color: yellow; background: orange;");
        // console.log({
        //     disabled,
        //     selectionId,
        //     state: this.state
        // });
        if (!disabled) {
            new Promise((resolve) => {
    
                if (multiple) {
                    if (this.state.selection[selectionId]) { // selected so we inselect
                        const newSelection = {
                            ...this.state.selection
                        };
                        delete newSelection[selectionId];
        
                        this.setState({
                            selection: newSelection
                        }, () => {
                            if (typeof onUnselect === 'function') onUnselect(selectionId, this.state.selection, metaData, this.resetSelection);
    
                            resolve({
                                select: false,
                                unselect: true,
                                multiple: false
                            });
                        });
                    } else { // select it (as it is not selected)
                        this.setState({
                            ...this.state.selection,
                            selection: {
                                ...this.state.selection,
                                [selectionId]: true
                            }
                        }, () => {
                            // console.log("%conElselect no multiple !!!", "color: yellow; background: black;");
                            // console.log({
                            //     selectionId,
                            //     selection: this.state.selection
                            // });
                            if (typeof onSelect === 'function') onSelect(selectionId, this.state.selection, metaData, this.resetSelection);
    
                            resolve({
                                select: true,
                                unselect: false,
                                multiple: true
                            });
                        });
                    }
                } else { // not multiple 
                    const oldSelectionIds = Object.keys(this.state.selection); 
                    const unselect = oldSelectionIds.length > 0 ? true: false;
                    this.setState({
                        selection: {
                            [selectionId]: true // removing anything else, and choose the new one
                        }
                    }, () => {
                        resolve({
                            select: true,
                            unselect,
                            oldSelectionIds,
                            multiple: false
                        });
                        if (typeof onSelect === 'function') onSelect(selectionId, this.state.selection, metaData, this.resetSelection);
                    });
                    // just doing the selection (not closing anything)
                }
            })
            .then((selectionInfo) => { // state changed
                if (typeof onSelectionChange === 'function') onSelectionChange(this.state.selection);
                // console.log("%conElClick flexSELECT", "color: yellow; background: black;");
                // console.log({
                //     selectionId, 
                //     selectionInfo,
                //     selection: this.state.selection
                // });
                if (typeof onElClick === 'function') onElClick(selectionId, selectionInfo, this.state.selection, metaData, this.resetSelection);
            });
        }
    }

    confirm = () => {
        const { metaData, onConfirm } = this.props;

        if (typeof onConfirm === 'function') onConfirm(this.state.selection,  metaData, this.resetSelection);

        // can handle that conditionally
        // this.setState({
        //     selection: {}
        // }, () => {
            
        // })
    }

    cancel = () => {
        const { metaData, onCancel, onSelectionChange } = this.props;

        const selectionBeforeCancel = {...this.state.selection};

        
        this.setState(
            {
                selection: {}
            },
            () => {
                if (typeof onSelectionChange === 'function') onSelectionChange({}, true); 

                if (typeof onCancel === 'function') onCancel(selectionBeforeCancel,  metaData);
            }
        )
    }

    unselectAll = () => {
        const { metaData, onUnselectAll, onSelectionChange } = this.props;
        const selectionBeforeUnselect = {...this.state.selection};

        this.setState({
            selection: {}
        }, () => {
            if (typeof onSelectionChange === 'function') onSelectionChange({}); 
            if (typeof onUnselectAll === 'function') onUnselectAll(selectionBeforeUnselect,  metaData);
        });
    }

    setAsEl = (el, selectionId) => {
        return React.cloneElement(
            el,
            {
                onClick: () => { this.onElClick(selectionId) }
            }
        )
    }

	render() {
        const { list,  renderEl, multiple, forceConfirm, confirmBtnName, cancelBtnName, unselectAllBtnName, controls, classType, children, className, disabled} = this.props;

		return (
        <div 
            className={
                classNames(
                    'FlexSelect',
                    className,
                    {
                        [classType]: !!classType
                    },
                    {
                        disabled
                    }
                )
            }
        >
            <div className="selectionContainer">
                {
                    children({
                        setAsEl: this.setAsEl,
                        selection: this.state.selection
                        // later offer ready nice renderers (next projects and needs)
                    }) // rendering prop
                }
            </div>
            {
                controls &&
                <div className="controls">
                    {
                        (multiple || forceConfirm) && 
                        <div className="confirm btn btn-primary btn-rounded" onClick={this.confirm}>
                            {
                                confirmBtnName
                            }
                        </div>
                    }
                    <div className="cancel btn btn-secondary btn-rounded" onClick={this.cancel}>
                        {
                            cancelBtnName
                        }
                    </div>
                    {   
                        multiple &&
                        <div className="unselectAll btn btn-secondary btn-rounded" onClick={this.unselectAll}>
                            {
                                unselectAllBtnName
                            }
                        </div>
                    }
                </div>
            }
        </div>
        );
	}
}

FlexSelect.defaultProps = {
    list: [],
    multiple: false,
    forceConfirm: false,
    confirmBtnName: 'Select',
    cancelBtnName: 'Cancel',
    unselectAllBtnName: 'Unselect all',
    controls: true,
    getSelection: null,
    onSelectionChange: null
}

export default FlexSelect;
