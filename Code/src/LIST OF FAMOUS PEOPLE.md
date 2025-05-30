LIST OF FAMOUS PEOPLE
ALIVE
-- Entertainment (Actors, Musicians, Directors, Comedians, etc.)
?Taylor Swift (Singer) - 34 years old, plays instruments, sings, Solo artist, blue eyes, blonde, tall, awarded
?Beyoncé (Singer)- 43 years old, plays instruments, sings, solo artist, brow eyes, brown hair, tall, awarded
?Billie Eilish (Singer)- 
?Lady Gaga (Singer)
?Adele (Singer)
?Ed Sheeran (Singer)
?The Weeknd (Singer)
?Harry Styles (Singer/Actor)
?Ariana Grande (Singer)
?Dua Lipa (Singer)
?Olivia Rodrigo (Singer)
?Justin Bieber (Singer)
?Dua Lipa (Singer)
?Olivia Rodrigo (Singer)
?Justin Bieber (Singer)
?Madonna (Singer)
?Timothée Chalamet (Actor)
?Zendaya (Actress)
?Leonardo DiCaprio (Actor)
?Brad Pitt (Actor)
?Margot Robbie (Actress)
?Jennifer Lawrence (Actress)
?Denzel Washington (Actor)
?Tom Cruise (Actor)
?Robert Downey Jr. (Actor)
?Chris Hemsworth (Actor)
?Keanu Reeves (Actor)
?Meryl Streep (Actress)
?Viola Davis (Actress)







--Business & Tech
Elon Musk (Entrepreneur)
Jeff Bezos (Entrepreneur)
Bill Gates (Entrepreneur)
Mark Zuckerberg (Entrepreneur)
Tim Cook (Apple CEO)
Sundar Pichai (Google CEO)
Warren Buffett (Investor)
Politics & World Leaders
Joe Biden (US President)
Donald Trump (Former US President)
Barack Obama (Former US President)
Vladimir Putin (Russian President)
Xi Jinping (Chinese President)
Emmanuel Macron (French President)
Volodymyr Zelenskyy (Ukrainian President)
Narendra Modi (Indian Prime Minister)
Kamala Harris (US Vice President)

--Sports
Lionel Messi (Soccer)
Cristiano Ronaldo (Soccer)
Neymar Jr. (Soccer)
Kylian Mbappé (Soccer)
LeBron James (Basketball)
Stephen Curry (Basketball)
Giannis Antetokounmpo (Basketball)
Serena Williams (Tennis)
Roger Federer (Tennis)
Novak Djokovic (Tennis)
Lewis Hamilton (Formula 1)
Tom Brady (Football)
Simone Biles (Gymnastics)

--Writers, Journalists, & Intellectuals
J.K. Rowling (Author)
Stephen King (Author)
George R.R. Martin (Author)
Malcolm Gladwell (Author)
Yuval Noah Harari (Author)

--Science & Space Exploration
Neil deGrasse Tyson (Astrophysicist)
Jane Goodall (Primatologist)
Michio Kaku (Physicist)
Peter Higgs (Physicist)

--Social Activists & Influential Figures
Greta Thunberg (Climate Activist)
Malala Yousafzai (Activist)
Oprah Winfrey (TV Host/Philanthropist)
Dalai Lama (Religious Leader)
Miscellaneous Famous Figures
Kim Kardashian (Reality Star)
Kylie Jenner (Entrepreneur)

Rihanna (Singer/Businesswoman)

Gordon Ramsay (Chef)
MrBeast (YouTuber)
PewDiePie (YouTuber)
Joe Rogan (Podcast Host)
Dwayne "The Rock" Johnson (Actor/Wrestler)
John Cena (Wrestler/Actor)
Vin Diesel (Actor)
Morgan Freeman (Actor)
Steve Harvey (TV Host)
Jimmy Fallon (TV Host)
Trevor Noah (Comedian)
Dave Chappelle (Comedian)
Kevin Hart (Comedian)

Andrew Tate (Internet Personality)
Jordan Peterson (Psychologist)
Robert Kiyosaki (Financial Author)
Jake Paul (YouTuber/Boxer)
Logan Paul (YouTuber/Boxer)
Elon Musk (again—because he does so much!)



DECEASED

--Entertainment & Music
Michael Jackson (Singer)
Elvis Presley (Singer)
Whitney Houston (Singer)
Freddie Mercury (Singer)
Prince (Singer)
David Bowie (Singer)
Aretha Franklin (Singer)
Bob Marley (Musician)
John Lennon (The Beatles)
Paul Walker (Actor)
Chadwick Boseman (Actor)
Heath Ledger (Actor)
Robin Williams (Actor)
James Dean (Actor)
Philip Seymour Hoffman (Actor)
Betty White (Actress)
Marlon Brando (Actor)
Carrie Fisher (Actress)

--Sports
Kobe Bryant (Basketball)
Diego Maradona (Soccer)
Pelé (Soccer)
Muhammad Ali (Boxing)
Ayrton Senna (F1 Racer)
Politics & World Leaders
Queen Elizabeth II (British Monarch)
Nelson Mandela (South African Leader)
John F. Kennedy (US President)
Martin Luther King Jr. (Activist)
Mahatma Gandhi (Activist)
Winston Churchill (British Prime Minister)

--Science & Innovation
Albert Einstein (Physicist)
Stephen Hawking (Physicist)
Nikola Tesla (Inventor)
Marie Curie (Scientist)
Isaac Newton (Scientist)

--Writers & Thinkers
William Shakespeare (Playwright)
George Orwell (Author)
Ernest Hemingway (Author)
Mark Twain (Author)
Edgar Allan Poe (Author)

--Influential Figures
Steve Jobs (Apple Founder)
Karl Marx (Political Theorist)
Sigmund Freud (Psychologist)
Vincent van Gogh (Painter)
Leonardo da Vinci (Polymath)
Pablo Picasso (Painter)
Mother Teresa (Humanitarian)
Charles Darwin (Scientist)
Adolf Hitler (Dictator)
Joseph Stalin (Dictator)
Julius Caesar (Roman Leader)

 states: {
          Prompt: {
            entry: {type: "spst.speak", params: ({ context}) => ({utterance: getQuestionForCategory(context.currentCategory)})},
            on: {SPEAK_COMPLETE: "Listen"},  
          },
          NoInput: {
            entry: {type: "spst.speak", params: {utterance: "Can you repeat?"}},
            on: {SPEAK_COMPLETE: "Listen"},
          },
          Listen: {
            entry: {type: "spst.listen"},
            on: {
              RECOGNISED: {
                actions: assign(({event})=>({lastResult: event.value})),
              },
              ASR_NOINPUT: {
                actions: assign({lastResult: null}),
              },
            },
          },
        },