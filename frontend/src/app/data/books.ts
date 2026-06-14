export interface Book {
  book_id: string;
  title: string;
  author_name: string;
  average_rating: number;
  ratings_count: number;
  publication_year: number;
  image_url: string;
  genres: string[];
  series_title: string;
  description: string;
}

export const mockBooks: Book[] = [
  {
    book_id: "1",
    title: "The Silent Patient",
    author_name: "Alex Michaelides",
    average_rating: 4.5,
    ratings_count: 345000,
    publication_year: 2019,
    image_url: "https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?w=400",
    genres: ["Mystery", "Thriller", "Psychological"],
    series_title: "Standalone Book",
    description: "A woman shoots her husband and never speaks again. A psychotherapist tries to uncover the truth behind her silence in this gripping psychological thriller."
  },
  {
    book_id: "2",
    title: "Gone Girl",
    author_name: "Gillian Flynn",
    average_rating: 4.3,
    ratings_count: 892000,
    publication_year: 2012,
    image_url: "https://images.unsplash.com/photo-1777135435499-ae71dd4ef870?w=400",
    genres: ["Mystery", "Thriller", "Crime"],
    series_title: "Standalone Book",
    description: "On their fifth anniversary, a man's wife disappears. As the investigation unfolds, secrets and lies create a web of deception."
  },
  {
    book_id: "3",
    title: "The Girl with the Dragon Tattoo",
    author_name: "Stieg Larsson",
    average_rating: 4.6,
    ratings_count: 756000,
    publication_year: 2005,
    image_url: "https://images.unsplash.com/photo-1734082134123-2e0eec840768?w=400",
    genres: ["Mystery", "Crime", "Thriller"],
    series_title: "Millennium Series #1",
    description: "A journalist and a computer hacker investigate a wealthy family's dark history in this international bestselling mystery."
  },
  {
    book_id: "4",
    title: "And Then There Were None",
    author_name: "Agatha Christie",
    average_rating: 4.7,
    ratings_count: 623000,
    publication_year: 1939,
    image_url: "https://images.unsplash.com/photo-1593510987185-1ec2256148a3?w=400",
    genres: ["Mystery", "Crime", "Classic"],
    series_title: "Standalone Book",
    description: "Ten strangers are invited to an island where they are accused of crimes and mysteriously murdered one by one."
  },
  {
    book_id: "5",
    title: "Big Little Lies",
    author_name: "Liane Moriarty",
    average_rating: 4.4,
    ratings_count: 534000,
    publication_year: 2014,
    image_url: "https://images.unsplash.com/photo-1582203914689-d5cc1850fcb2?w=400",
    genres: ["Mystery", "Thriller", "Contemporary"],
    series_title: "Standalone Book",
    description: "Three women's lives converge at a school trivia night that ends in murder. Who died? And who killed them?"
  },
  {
    book_id: "6",
    title: "The Da Vinci Code",
    author_name: "Dan Brown",
    average_rating: 4.2,
    ratings_count: 945000,
    publication_year: 2003,
    image_url: "https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?w=400",
    genres: ["Mystery", "Thriller", "Adventure"],
    series_title: "Robert Langdon #2",
    description: "A symbologist races through Europe following clues hidden in Da Vinci's artwork to uncover a religious mystery."
  },
  {
    book_id: "7",
    title: "The Girl on the Train",
    author_name: "Paula Hawkins",
    average_rating: 4.1,
    ratings_count: 678000,
    publication_year: 2015,
    image_url: "https://images.unsplash.com/photo-1777135435499-ae71dd4ef870?w=400",
    genres: ["Mystery", "Thriller", "Psychological"],
    series_title: "Standalone Book",
    description: "A woman's daily train commute becomes an obsession as she witnesses something shocking from her window."
  },
  {
    book_id: "8",
    title: "The Hound of the Baskervilles",
    author_name: "Arthur Conan Doyle",
    average_rating: 4.5,
    ratings_count: 412000,
    publication_year: 1902,
    image_url: "https://images.unsplash.com/photo-1734082134123-2e0eec840768?w=400",
    genres: ["Mystery", "Crime", "Classic"],
    series_title: "Sherlock Holmes",
    description: "Sherlock Holmes and Dr. Watson investigate a legendary curse and supernatural hound on the moors."
  },
  {
    book_id: "9",
    title: "In the Woods",
    author_name: "Tana French",
    average_rating: 4.3,
    ratings_count: 298000,
    publication_year: 2007,
    image_url: "https://images.unsplash.com/photo-1593510987185-1ec2256148a3?w=400",
    genres: ["Mystery", "Crime", "Thriller"],
    series_title: "Dublin Murder Squad #1",
    description: "A detective investigates a murder in the woods where he survived a childhood trauma that left two friends missing."
  },
  {
    book_id: "10",
    title: "The Woman in the Window",
    author_name: "A.J. Finn",
    average_rating: 4.0,
    ratings_count: 445000,
    publication_year: 2018,
    image_url: "https://images.unsplash.com/photo-1582203914689-d5cc1850fcb2?w=400",
    genres: ["Mystery", "Thriller", "Psychological"],
    series_title: "Standalone Book",
    description: "An agoraphobic woman believes she witnessed a crime in her neighbor's house, but no one believes her."
  },
  {
    book_id: "11",
    title: "Sharp Objects",
    author_name: "Gillian Flynn",
    average_rating: 4.2,
    ratings_count: 387000,
    publication_year: 2006,
    image_url: "https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?w=400",
    genres: ["Mystery", "Thriller", "Psychological"],
    series_title: "Standalone Book",
    description: "A reporter returns to her hometown to cover a series of child murders and confronts her own dark past."
  },
  {
    book_id: "12",
    title: "The Cuckoo's Calling",
    author_name: "Robert Galbraith",
    average_rating: 4.4,
    ratings_count: 521000,
    publication_year: 2013,
    image_url: "https://images.unsplash.com/photo-1777135435499-ae71dd4ef870?w=400",
    genres: ["Mystery", "Crime", "Detective"],
    series_title: "Cormoran Strike #1",
    description: "A private detective investigates the death of a supermodel in this brilliant debut mystery."
  },
  {
    book_id: "13",
    title: "Murder on the Orient Express",
    author_name: "Agatha Christie",
    average_rating: 4.6,
    ratings_count: 589000,
    publication_year: 1934,
    image_url: "https://images.unsplash.com/photo-1734082134123-2e0eec840768?w=400",
    genres: ["Mystery", "Crime", "Classic"],
    series_title: "Hercule Poirot",
    description: "Detective Hercule Poirot investigates a murder aboard a luxurious train stranded by snow."
  },
  {
    book_id: "14",
    title: "The Snowman",
    author_name: "Jo Nesbø",
    average_rating: 4.1,
    ratings_count: 376000,
    publication_year: 2007,
    image_url: "https://images.unsplash.com/photo-1593510987185-1ec2256148a3?w=400",
    genres: ["Mystery", "Crime", "Thriller"],
    series_title: "Harry Hole #7",
    description: "A detective hunts a serial killer who leaves snowmen as his calling card in this chilling Nordic noir."
  },
  {
    book_id: "15",
    title: "The Secret History",
    author_name: "Donna Tartt",
    average_rating: 4.5,
    ratings_count: 712000,
    publication_year: 1992,
    image_url: "https://images.unsplash.com/photo-1582203914689-d5cc1850fcb2?w=400",
    genres: ["Mystery", "Thriller", "Literary"],
    series_title: "Standalone Book",
    description: "An elite group of classics students at a New England college commit a shocking murder."
  },
  {
    book_id: "16",
    title: "The No. 1 Ladies' Detective Agency",
    author_name: "Alexander McCall Smith",
    average_rating: 4.3,
    ratings_count: 234000,
    publication_year: 1998,
    image_url: "https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?w=400",
    genres: ["Mystery", "Crime", "Cozy Mystery"],
    series_title: "No. 1 Ladies' Detective Agency #1",
    description: "The first female private detective in Botswana solves cases with wisdom, humor, and compassion."
  },
  {
    book_id: "17",
    title: "The Reversal",
    author_name: "Michael Connelly",
    average_rating: 4.3,
    ratings_count: 198000,
    publication_year: 2010,
    image_url: "https://images.unsplash.com/photo-1777135435499-ae71dd4ef870?w=400",
    genres: ["Mystery", "Crime", "Legal Thriller"],
    series_title: "Harry Bosch",
    description: "A detective must work with his half-brother to retry a convicted child killer."
  },
  {
    book_id: "18",
    title: "The Devotion of Suspect X",
    author_name: "Keigo Higashino",
    average_rating: 4.4,
    ratings_count: 267000,
    publication_year: 2005,
    image_url: "https://images.unsplash.com/photo-1734082134123-2e0eec840768?w=400",
    genres: ["Mystery", "Crime", "Japanese"],
    series_title: "Detective Galileo #1",
    description: "A mathematician creates the perfect alibi for his neighbor in this brilliant Japanese mystery."
  },
  {
    book_id: "19",
    title: "The Talented Mr. Ripley",
    author_name: "Patricia Highsmith",
    average_rating: 4.2,
    ratings_count: 345000,
    publication_year: 1955,
    image_url: "https://images.unsplash.com/photo-1593510987185-1ec2256148a3?w=400",
    genres: ["Mystery", "Thriller", "Crime"],
    series_title: "Ripley #1",
    description: "A young con artist assumes another man's identity in this classic psychological thriller."
  },
  {
    book_id: "20",
    title: "Before I Go to Sleep",
    author_name: "S.J. Watson",
    average_rating: 4.1,
    ratings_count: 423000,
    publication_year: 2011,
    image_url: "https://images.unsplash.com/photo-1582203914689-d5cc1850fcb2?w=400",
    genres: ["Mystery", "Thriller", "Psychological"],
    series_title: "Standalone Book",
    description: "A woman with amnesia wakes up every day not remembering her past and discovers disturbing truths."
  }
];
