import { FaDiscord, FaGithub, FaInstagram } from "react-icons/fa";

import MainContainer from "../components/containers/MainContainer";
import BigTitle from "../components/Text/BigTitle";
import Subtitle from "../components/Text/Subtitle";
import { cn } from "../components/utils";

const CONTENT = {
  home: {
    title: "Viennalytics",
    description: "A Comprehensive Analysis on Chess Openings",
    githubAlt: "GitHub",
    dscAlt: "University of Waterloo Data Science Club",
    instagramAlt: "Instagram",
    discordAlt: "Discord"
  }
};

const Homepage = () => (
  <MainContainer>
    <div className={cn("flex flex-col items-center justify-center flex-1 w-full h-full min-h-0 gap-3 text-center select-none animate-slideIn")}>
      <BigTitle>
        {CONTENT.home.title}
      </BigTitle>
      <Subtitle>
        {CONTENT.home.description}
      </Subtitle>
      <hr className={cn("w-full my-5 text-white max-w-1/3")} />
      <div className={cn("flex flex-row items-center justify-between w-1/2 max-w-80 gap-x-4")}>
        <a href="https://github.com/elphoun/viennalytics" aria-label={CONTENT.home.githubAlt}>
          <FaGithub className={cn("w-8 h-8 transition-all hover:brightness-50")} />
        </a>
        <a href="https://www.uwdatascience.ca/" aria-label={CONTENT.home.dscAlt}>
          <img src="dsc.svg" alt={CONTENT.home.dscAlt} className={cn("h-full transition-all max-h-8 hover:brightness-50")} />
        </a>
        <a href="https://www.instagram.com/uwaterloodsc/" aria-label={CONTENT.home.instagramAlt}>
          <FaInstagram className={cn("w-8 h-8 transition-all hover:brightness-50")} />
        </a>
        <a href="https://discord.gg/Vj5aVvahKm" aria-label={CONTENT.home.discordAlt}>
          <FaDiscord className={cn("w-8 h-8 transition-all hover:brightness-50")} />
        </a>
      </div>
    </div>
  </MainContainer>
);

export default Homepage;