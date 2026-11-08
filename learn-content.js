/* mAEIOw Learn content. Edit freely.
   try links open the Diagrams page: diagrams.html?m=<mood>&fig=<1–4>&imp=<0|1>&v=<view> */
window.LEARN={key:'maeiow-learn',
sepNames:{'aristotle-logic':'Aristotle’s Logic','square':'The Traditional Square of Opposition'},
tabs:[
{id:'glossary',label:'Glossary',search:true,items:[
 {h:'Term',p:['A word or phrase that names a class of things. A categorical statement links two terms: a subject (S) and a predicate (P).'],rows:[['Example','“mammals”, “things that can fly”']],sep:'aristotle-logic'},
 {h:'Categorical proposition',p:['A statement saying that all, none or some of one class belong to another. Every one has a quantity (universal or particular) and a quality (affirmative or negative).'],sep:'aristotle-logic'},
 {h:'A: universal affirmative',fm:'All S are P',p:['Every S is a P. The letter comes from AffIrmo (“I affirm”).'],rows:[['Distributes','S']],try:['diagrams.html?m=AAA&fig=1&v=euler','See it as Euler diagrams']},
 {h:'E: universal negative',fm:'No S are P',p:['Nothing is both S and P. The letter comes from nEgO (“I deny”).'],rows:[['Distributes','S and P']],try:['diagrams.html?m=EAE&fig=1&v=euler','See it as Euler diagrams']},
 {h:'I: particular affirmative',fm:'Some S are P',p:['At least one S is a P.'],rows:[['Distributes','neither term']],try:['diagrams.html?m=AII&fig=1&v=euler','See it as Euler diagrams']},
 {h:'O: particular negative',fm:'Some S are not P',p:['At least one S is not a P.'],rows:[['Distributes','P']],try:['diagrams.html?m=EIO&fig=1&v=euler','See it as Euler diagrams']},
 {h:'Distribution',p:['A term is distributed when the statement says something about every member of its class. The pattern: A distributes its subject; E both terms; I neither; O its predicate.'],sep:'aristotle-logic'},
 {h:'Syllogism',p:['An argument with two premises and a conclusion, built from three terms, each appearing in exactly two of the statements.'],rows:[['Example','All M are P; all S are M; so all S are P.']],try:['diagrams.html?m=AAA&fig=1&v=venn','See Barbara in a Venn diagram'],sep:'aristotle-logic'},
 {h:'Major, minor and middle terms',p:['The major term (P) is the predicate of the conclusion; the minor term (S) is its subject. The middle term (M) appears in both premises but not the conclusion. The premise with P is the major premise and is written first.']},
 {h:'Mood',p:['The three statement types of a syllogism, in the order major premise, minor premise, conclusion.'],rows:[['Example','AAA, EIO, OAO']]},
 {h:'Figure',p:['Where the middle term sits in the premises. 1: M–P, S–M. 2: P–M, S–M. 3: M–P, M–S. 4: P–M, M–S. Mood plus figure (AAA-1, say) fixes the argument’s form.'],try:['diagrams.html?m=AAA&fig=1&v=moods','See all moods and figures']},
 {h:'Medieval names',p:['Each valid form got a Latin name whose vowels spell its mood: Barbara (AAA-1), Celarent (EAE-1), Darii (AII-1), Ferio (EIO-1), Cesare, Camestres, Baroco, Bocardo, and so on.'],try:['diagrams.html?m=EAE&fig=1&v=venn','See Celarent']},
 {h:'Existential import',p:['Whether a universal statement assumes its subject class has members. Traditional logic assumes it; modern (Boolean) logic doesn’t. Nine of the 24 traditional valid forms, and most of the square of opposition, depend on it.'],try:['diagrams.html?m=AAI&fig=3&imp=0&v=venn','See Darapti fail without it'],sep:'square'},
 {h:'Square of opposition',p:['A diagram relating A, E, I and O with the same terms: contradictories, contraries, subcontraries and subalterns.'],try:['diagrams.html?m=AAA&fig=1&v=square','Open the square'],sep:'square'},
 {h:'Contradictories',p:['A and O, and E and I: exactly one of each pair is true. These hold with or without existential import.'],try:['diagrams.html?m=AAA&fig=1&v=square','See them on the square']},
 {h:'Contraries and subcontraries',p:['Traditionally, A and E can’t both be true (contraries), and I and O can’t both be false (subcontraries). Both fail in modern logic when the subject class is empty.'],sep:'square'},
 {h:'Subalternation',p:['Traditionally, A implies I and E implies O. Fails in modern logic when the subject class is empty: “All unicorns are white” is vacuously true but “some unicorns are white” is false.'],sep:'square'},
 {h:'Conversion',p:['Swapping subject and predicate. Valid for E and I. A converts only “by limitation” (All S are P, so some P are S), which needs existential import. O doesn’t convert.']},
 {h:'Obversion',p:['Changing the quality and replacing the predicate with its complement. Valid for all four forms.'],pair:[['From','All S are P'],['To','No S are non-P']]},
 {h:'Contraposition',p:['Swapping subject and predicate and replacing both with their complements. Valid for A and O.'],pair:[['From','All S are P'],['To','All non-P are non-S']]},
 {h:'Enthymeme',p:['A syllogism with a premise or the conclusion left unstated.'],rows:[['Example','“Socrates is mortal; he’s a man.” The missing premise is “All men are mortal”.']]}
]},
{id:'fallacies',label:'Fallacies',lead:'Each breaks one of the traditional rules of the syllogism. Open one in Diagrams to see the counterexample.',items:[
 {h:'Undistributed middle',p:['The middle term isn’t distributed in either premise, so the premises never link S and P.'],rows:[['Form','All P are M; all S are M; so all S are P (AAA-2)'],['Example','All dogs are mammals; all cats are mammals; so all cats are dogs.']],try:['diagrams.html?m=AAA&fig=2&v=venn','See the counterexample']},
 {h:'Illicit major',p:['The major term is distributed in the conclusion but not in its premise.'],rows:[['Form','All M are P; no S are M; so no S are P (AEE-1)'],['Example','All dogs are mammals; no cats are dogs; so no cats are mammals.']],try:['diagrams.html?m=AEE&fig=1&v=venn','See the counterexample']},
 {h:'Illicit minor',p:['The minor term is distributed in the conclusion but not in its premise.'],rows:[['Form','All M are P; all M are S; so all S are P (AAA-3)'],['Example','All dogs are mammals; all dogs are pets; so all pets are mammals.']],try:['diagrams.html?m=AAA&fig=3&v=venn','See the counterexample']},
 {h:'Exclusive premises',p:['Both premises are negative, so nothing connects the terms.'],rows:[['Form','No M are P; no S are M; so no S are P (EEE-1)']],try:['diagrams.html?m=EEE&fig=1&v=venn','See the counterexample']},
 {h:'Affirmative conclusion from a negative premise',p:['If a premise is negative, the conclusion must be negative too.'],rows:[['Form','No M are P; all S are M; so all S are P (EAA-1)']],try:['diagrams.html?m=EAA&fig=1&v=venn','See the counterexample']},
 {h:'Existential fallacy',p:['A particular conclusion from two universal premises. Valid traditionally (Darapti, Bramantip, …) but not in modern logic, because universals don’t say anything exists.'],rows:[['Form','All M are P; all M are S; so some S are P (AAI-3, Darapti)']],try:['diagrams.html?m=AAI&fig=3&imp=0&v=venn','See it fail without existential import']},
 {h:'Four terms',p:['A word is used in two senses, so there are really four terms, not three.'],rows:[['Example','Nothing is better than happiness; a sandwich is better than nothing; so a sandwich is better than happiness.']]}
]},
{id:'ambiguity',label:'Ambiguity',lead:'Everyday sentences that can be read as more than one categorical statement.',items:[
 {h:'“All that glitters is not gold”',pair:[['Reading 1 (E)','No glittering things are gold'],['Reading 2 (O)','Some glittering things are not gold']],p:['The proverb means the O reading. “All … not” is a classic scope trap.']},
 {h:'“Some students passed”',pair:[['Logic (I)','Some students passed'],['Conversation','Some passed, and some didn’t (I and O)']],p:['In logic “some” means “at least one”, possibly all. The “not all” is conversational implicature.']},
 {h:'“Only members may vote”',pair:[['Correct (A)','All voters are members'],['Common mistake (A)','All members are voters']],p:['“Only S are P” means “All P are S”: the terms swap.']},
 {h:'“Not all birds can fly”',pair:[['As O','Some birds are not things that can fly'],['Not','No birds can fly (E)']],p:['Denying an A gives its contradictory, O, not the contrary E.']},
 {h:'“Everyone isn’t here”',pair:[['Reading 1 (E)','No one is here'],['Reading 2 (O)','Some people are not here']],p:['Usually meant as O (“not everyone is here”).']},
 {h:'“Whales are mammals” / “Dogs are in the garden”',pair:[['Generic (A)','All whales are mammals'],['Particular (I)','Some dogs are in the garden']],p:['A bare plural can be universal or particular; context decides.']}
]},
{id:'standard',label:'Standard form',lead:'How to put ordinary English into one of the four standard forms before diagramming it.',items:[
 {h:'Singular statements',p:['Treat a named individual as a class with one member.'],pair:[['English','Socrates is mortal'],['Standard (A)','All things identical to Socrates are mortal']]},
 {h:'Verbs, not “are”',p:['Rewrite the predicate as a class so the copula is “are”.'],pair:[['English','Some cats climb trees'],['Standard (I)','Some cats are tree-climbers']]},
 {h:'“None but”, “only”',pair:[['English','None but the brave deserve the fair'],['Standard (A)','All who deserve the fair are brave']]},
 {h:'“Whoever”, “anyone who”',pair:[['English','Whoever studies passes'],['Standard (A)','All people who study are people who pass']]},
 {h:'“A few”, “most”, “many”',p:['These are stronger than “some”, but the standard form can only keep the “at least one” part.'],pair:[['English','Most voters agree'],['Standard (I)','Some voters are people who agree']]},
 {h:'Not every sentence fits',p:['Relations (“every child loves some parent”) and nested quantities need predicate logic. That’s AllyEx’s job.']}
]}
]};
