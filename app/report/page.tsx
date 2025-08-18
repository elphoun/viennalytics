import { memo } from "react";
import { GraphIcon, Title } from "../_components";
import DataOverview from "./_paragraphs/DataOverview";
import Introduction from "./_paragraphs/Introduction";
import KeyTermsSection from "./_paragraphs/KeyTerms";
import Preparation from "./_paragraphs/Preparation";
import Topic1 from "./_paragraphs/Topic1";
import Topic2 from "./_paragraphs/Topic2";
import ResultsDiscussion from "./_paragraphs/ResultsDiscussion";


const Report = memo(() => {
    return (
        <div className="w-full h-full space-y-10">
            <Title text="Report" icon={<GraphIcon />} />

            <div className="bg-orange-100/20 w-3/5 min-w-md rounded-md p-5 space-y-10 mx-auto">
                <KeyTermsSection />
                <Introduction />
                <Preparation />
                <DataOverview />
                <Topic1 />
                <Topic2 />
                <ResultsDiscussion />
            </div>
        </div>
    );
});

Report.displayName = "Report";

export default Report;