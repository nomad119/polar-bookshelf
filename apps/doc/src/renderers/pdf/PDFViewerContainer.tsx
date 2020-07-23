import * as React from "react";
import {useContextMenu} from "../../../../repository/js/doc_repo/MUIContextMenu";
import {Elements} from "../../../../../web/js/util/Elements";
import {GlobalPDFCss} from "./GlobalPDFCss";
import {memoForwardRef} from "../../../../../web/js/react/ReactUtils";
import {useViewerContainerCallbacks, useViewerContainerStore} from "../../ViewerContainerStore";

let iter: number = 0;

interface IProps {
    readonly children: JSX.Element;
}

export const PDFViewerContainer = memoForwardRef((props: IProps) => {

    const contextMenu = useContextMenu();

    // FIXME: now this is the bug that the store isn't being updated but it should...
    const {viewerContainer} = useViewerContainerStore(['viewerContainer']);
    const {setViewerContainer} = useViewerContainerCallbacks();

    console.log("FIXME rendering witih viewerContainer ", viewerContainer);

    const onContextMenu = React.useCallback((event: React.MouseEvent<HTMLElement>) => {

        const pageElement = Elements.untilRoot(event.target as HTMLElement, ".page");

        if (! pageElement) {
            console.warn("Not found within .page element");
            return;
        }

        contextMenu.onContextMenu(event);

    }, []);

    return (
        <>
            <GlobalPDFCss/>
            <main onContextMenu={onContextMenu}
                  id="viewerContainer"
                  className="viewerContainer"
                  ref={ref => setViewerContainer(ref)}
                  style={{
                      position: 'absolute',
                      overflow: 'auto',
                      top: '0',
                      width: '100%',
                      height: '100%'
                  }}
                  itemProp="mainContentOfPage"
                  data-iter={iter++}>

                <div>
                    <div id="viewer" className="pdfViewer">
                        <div/>

                    </div>
                </div>

            </main>

            {viewerContainer && props.children}

        </>
    );

});
