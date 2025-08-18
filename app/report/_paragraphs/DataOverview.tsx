import { memo } from "react";
import { P } from "@/app/_components";
import Section from "@/app/_components/text/Section";
import Table from "@/app/_components/ui/Table";

const DataOverview = memo(() => (
    <Section title="Data Overview" icon="📊">
        <div className="space-y-1">
            <P indent={false}>Game Information</P>
            <Table
                rows={[
                    { field: "Evaluated Games", value: "173,266" },
                    { field: "Total Games", value: "70,510" },
                    { field: "Valid ELOs", value: "287,860" }
                ]}
            />
        </div>

        <div className="space-y-1">
            <P indent={false}>Game Results</P>
            <Table
                rows={[
                    { field: "White Wins", value: <span className="text-green-400">28,492 (40.4%)</span> },
                    { field: "Black Wins", value: <span className="text-red-400">22,887 (32.5%)</span> },
                    { field: "Draws", value: <span className="text-yellow-400">19,131 (27.1%)</span> }
                ]}
            />
        </div>

        <div className="space-y-1">
            <P indent={false}>Opening Statistics</P>
            <Table
                rows={[
                    { field: "Number of Unique Openings", value: <span className="text-purple-400">1,300</span> }
                ]}
            />
        </div>

        <div className="space-y-1">
            <P indent={false}>Most Popular Openings</P>
            <Table
                rows={[
                    { field: "1st", value: "Zuckertort Opening" },
                    { field: "2nd", value: "Queen's Pawn Game" },
                    { field: "3rd", value: "King's Indian" },
                    { field: "4th", value: "Rapport-Jabava System" },
                    { field: "5th", value: "Caro-Kann Defense: Exchange Variation" },
                    { field: "6th", value: "Queen's Pawn Game: London System" },
                    { field: "7th", value: "Sicilian Defense: Mascov Variation" },
                    { field: "8th", value: "Caro-Kann Defense: Advance Variation" },
                    { field: "9th", value: "Botvinnik-Carls Defense" },
                    { field: "10th", value: "King's Pawn Game" },
                    { field: "11th", value: "Catalan Opening: Closed" }
                ]}
            />
        </div>

        <div className="space-y-1">
            <P indent={false}>ELO Data</P>
            <Table
                rows={[
                    { field: "Minimum ELO", value: <span className="text-orange-400">635</span> },
                    { field: "Maximum ELO", value: <span className="text-orange-400">2,273</span> }
                ]}
            />
        </div>
    </Section>
));

DataOverview.displayName = "DataOverview";

export default DataOverview;