     const CAT_COLORS = {
        Fantasy: { bg: "#eae4f5", text: "#5a3f8a", spine: "#8b6bc7" },
        Mystery: { bg: "#e5eef7", text: "#1d4d7a", spine: "#4a88c7" },
        Romance: { bg: "#f7e4ea", text: "#8a2040", spine: "#c7607a" },
        Adventure: { bg: "#e7f0e3", text: "#2d5e28", spine: "#5da850" },
        Horror: { bg: "#f5e4e4", text: "#7a1f1f", spine: "#c75050" },
        "Sci-Fi": { bg: "#e3edf5", text: "#1a4060", spine: "#4080b0" },
        Historical: { bg: "#f5ede3", text: "#7a4a1a", spine: "#c0873a" },
        "Fairy Tale": { bg: "#f5e8d5", text: "#7a5020", spine: "#d4a050" },
        Other: { bg: "#f0ede8", text: "#7a6e60", spine: "#a09880" },
      };

      let books = JSON.parse(localStorage.getItem("myStoryBooks") || "[]");
      let wishlist = JSON.parse(
        localStorage.getItem("myStoryWishlist") || "[]",
      );
      let currentFilter = "";
      let currentView = "grid";
      let rating = 0;
      let pendingDeleteId = null;

      function save() {
        localStorage.setItem("myStoryBooks", JSON.stringify(books));
      }
      function saveWish() {
        localStorage.setItem("myStoryWishlist", JSON.stringify(wishlist));
      }

      function stars(n) {
        return Array.from(
          { length: 5 },
          (_, i) =>
            `<span style="color:${i < n ? "#c9973a" : "#ddd"}">${i < n ? "★" : "☆"}</span>`,
        ).join("");
      }
      function fmtDate(d) {
        return new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      document.querySelectorAll(".star-btn").forEach((btn) => {
        btn.addEventListener("mouseover", () => highlightStars(+btn.dataset.v));
        btn.addEventListener("mouseout", () => highlightStars(rating));
        btn.addEventListener("click", () => {
          rating = +btn.dataset.v;
          highlightStars(rating);
        });
      });
      function highlightStars(n) {
        document
          .querySelectorAll(".star-btn")
          .forEach((b) => b.classList.toggle("active", +b.dataset.v <= n));
      }

      function addBook() {
        const title = document.getElementById("fTitle").value.trim();
        const cat = document.getElementById("fCat").value;
        if (!title) {
          showToast("Please enter a book title");
          return;
        }
        if (!cat) {
          showToast("Please select a category");
          return;
        }
        books.unshift({
          id: Date.now(),
          title,
          author: document.getElementById("fAuthor").value.trim() || "Unknown",
          category: cat,
          rating,
          notes: document.getElementById("fNotes").value.trim(),
          added: Date.now(),
        });
        save();
        render();
        document.getElementById("fTitle").value = "";
        document.getElementById("fAuthor").value = "";
        document.getElementById("fCat").value = "";
        document.getElementById("fNotes").value = "";
        rating = 0;
        highlightStars(0);
        showToast("📚 Book added to your library!");
      }

      function filterCat(cat) {
        currentFilter = cat;
        document.querySelectorAll(".cat-chip").forEach((c) => {
          c.classList.remove("active");
          if (
            (cat === "" && c.classList.contains("all")) ||
            c.dataset.cat === cat
          )
            c.classList.add("active");
        });
        render();
      }

      function setView(v) {
        currentView = v;
        document
          .getElementById("vGrid")
          .classList.toggle("active", v === "grid");
        document
          .getElementById("vList")
          .classList.toggle("active", v === "list");
        render();
      }

      function openDeleteModal(id) {
        pendingDeleteId = id;
        document.getElementById("deleteModal").classList.add("open");
      }
      function closeModal() {
        pendingDeleteId = null;
        document.getElementById("deleteModal").classList.remove("open");
      }
      function confirmDelete() {
        books = books.filter((b) => b.id !== pendingDeleteId);
        save();
        render();
        closeModal();
        showToast("Book removed from library");
      }

      function showToast(msg) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 2800);
      }

      /* WISHLIST FUNCTIONS */
      function addWish() {
        const title = document.getElementById("wTitle").value.trim();
        if (!title) {
          showToast("Please enter a book title");
          return;
        }
        wishlist.unshift({
          id: Date.now(),
          title,
          author: document.getElementById("wAuthor").value.trim(),
          category: document.getElementById("wCat").value,
          priority: document.getElementById("wPriority").value,
          note: document.getElementById("wNote").value.trim(),
          added: Date.now(),
        });
        saveWish();
        renderWishlist();
        document.getElementById("wTitle").value = "";
        document.getElementById("wAuthor").value = "";
        document.getElementById("wCat").value = "";
        document.getElementById("wPriority").value = "med";
        document.getElementById("wNote").value = "";
        showToast("🛒 Added to your buy list!");
      }

      function deleteWish(id) {
        wishlist = wishlist.filter((w) => w.id !== id);
        saveWish();
        renderWishlist();
        showToast("Removed from buy list");
      }

      function markGot(id) {
        const w = wishlist.find((w) => w.id === id);
        if (!w) return;
        books.unshift({
          id: Date.now(),
          title: w.title,
          author: w.author || "Unknown",
          category: w.category || "Other",
          rating: 0,
          notes: w.note ? "From wishlist: " + w.note : "",
          added: Date.now(),
        });
        wishlist = wishlist.filter((x) => x.id !== id);
        save();
        saveWish();
        render();
        renderWishlist();
        showToast("🎉 Moved to your library! Don't forget to rate it.");
      }

      const PRIORITY_LABEL = {
        high: "🔴 High priority",
        med: "🟡 Medium priority",
        low: "🟢 Low priority",
      };
      const PRIORITY_CLASS = {
        high: "priority-high",
        med: "priority-med",
        low: "priority-low",
      };

      function renderWishlist() {
        const badge = document.getElementById("wishCount");
        badge.textContent =
          wishlist.length + (wishlist.length === 1 ? " book" : " books");
        const container = document.getElementById("wishlistContainer");
        if (!wishlist.length) {
          container.innerHTML =
            '<div class="wish-empty"><div class="wish-empty-icon">🔖</div><h4>Your buy list is empty</h4><p>Add books you want to read next using the form above.</p></div>';
          return;
        }
        const sorted = [...wishlist].sort((a, b) => {
          const p = { high: 0, med: 1, low: 2 };
          return (
            (p[a.priority] ?? 1) - (p[b.priority] ?? 1) || b.added - a.added
          );
        });
        container.innerHTML =
          '<div class="wishlist-grid">' +
          sorted
            .map((w) => {
              const c = w.category
                ? CAT_COLORS[w.category] || CAT_COLORS.Other
                : null;
              return (
                '<div class="wish-card">' +
                '<div class="wish-tag">To Buy</div>' +
                '<div class="wish-body">' +
                (c
                  ? '<span class="wish-cat-badge" style="background:' +
                    c.bg +
                    ";color:" +
                    c.text +
                    '">' +
                    w.category +
                    "</span>"
                  : "") +
                '<div class="wish-title">' +
                w.title +
                "</div>" +
                (w.author
                  ? '<div class="wish-author">by ' + w.author + "</div>"
                  : "") +
                '<div class="wish-priority ' +
                (PRIORITY_CLASS[w.priority] || "") +
                '">' +
                (PRIORITY_LABEL[w.priority] || "") +
                "</div>" +
                (w.note ? '<div class="wish-note">' + w.note + "</div>" : "") +
                "</div>" +
                '<div class="wish-footer">' +
                '<span class="wish-date">' +
                fmtDate(w.added) +
                "</span>" +
                '<div class="wish-actions">' +
                '<button class="btn-wish-got" onclick="markGot(' +
                w.id +
                ')" title="I got this book!">✓ Got it!</button>' +
                '<button class="btn-wish-del" onclick="deleteWish(' +
                w.id +
                ')" title="Remove">✕</button>' +
                "</div></div></div>"
              );
            })
            .join("") +
          "</div>";
      }

      function render() {
        const q = document.getElementById("searchInput").value.toLowerCase();
        const sort = document.getElementById("sortSelect").value;
        let filtered = books.filter((b) => {
          const matchCat = !currentFilter || b.category === currentFilter;
          const matchQ =
            !q ||
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q);
          return matchCat && matchQ;
        });
        filtered.sort((a, b) => {
          if (sort === "newest") return b.added - a.added;
          if (sort === "oldest") return a.added - b.added;
          if (sort === "title") return a.title.localeCompare(b.title);
          if (sort === "rating") return b.rating - a.rating;
          return 0;
        });
        const catCounts = {};
        books.forEach((b) => {
          catCounts[b.category] = (catCounts[b.category] || 0) + 1;
        });
        const cats = Object.keys(catCounts);
        const totalRated = books.filter((b) => b.rating > 0);
        const avgRating = totalRated.length
          ? (
              totalRated.reduce((s, b) => s + b.rating, 0) / totalRated.length
            ).toFixed(1)
          : null;
        const topCat =
          [...cats].sort((a, b) => catCounts[b] - catCounts[a])[0] || null;
        const maxCount = Math.max(...Object.values(catCounts), 1);
        document.getElementById("hTotal").textContent = books.length;
        document.getElementById("hCats").textContent = cats.length;
        document.getElementById("hAvgRating").textContent = avgRating
          ? "⭐" + avgRating
          : "—";
        document.getElementById("sTotal").textContent = books.length;
        document.getElementById("sCats").textContent = cats.length;
        document.getElementById("sAvg").textContent = avgRating
          ? avgRating
          : "—";
        document.getElementById("sTop").textContent = topCat || "—";
        const chipsCont = document.getElementById("catChips");
        chipsCont.innerHTML =
          '<span class="cat-chip all' +
          (!currentFilter ? " active" : "") +
          '" onclick="filterCat(\'\')">All <strong>' +
          books.length +
          "</strong></span>";
        Object.entries(catCounts)
          .sort((a, b) => b[1] - a[1])
          .forEach(([cat, cnt]) => {
            const c = CAT_COLORS[cat] || CAT_COLORS.Other;
            chipsCont.innerHTML +=
              '<span class="cat-chip' +
              (currentFilter === cat ? " active" : "") +
              '" data-cat="' +
              cat +
              '" style="background:' +
              c.bg +
              ";color:" +
              c.text +
              '" onclick="filterCat(\'' +
              cat +
              "')\">" +
              cat +
              " " +
              cnt +
              "</span>";
          });
        const barsCont = document.getElementById("statBars");
        barsCont.innerHTML =
          Object.entries(catCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, cnt]) => {
              const c = CAT_COLORS[cat] || CAT_COLORS.Other;
              const pct = Math.round((cnt / maxCount) * 100);
              return (
                '<div class="stat-bar-row"><div class="stat-bar-meta"><span class="stat-bar-name">' +
                cat +
                '</span><span class="stat-bar-count">' +
                cnt +
                " book" +
                (cnt !== 1 ? "s" : "") +
                '</span></div><div class="stat-track"><div class="stat-fill" style="width:' +
                pct +
                "%;background:" +
                c.spine +
                '"></div></div></div>'
              );
            })
            .join("") ||
          '<p style="color:var(--muted);font-size:0.8rem;">No books yet.</p>';
        const container = document.getElementById("booksContainer");
        if (!filtered.length) {
          container.innerHTML =
            '<div class="empty"><div class="empty-icon">📭</div><h3>' +
            (books.length
              ? "No books match your search"
              : "Your library is empty") +
            "</h3><p>" +
            (books.length
              ? "Try different search terms or clear the filter."
              : "Add your first story book using the form on the left!") +
            "</p></div>";
          renderWishlist();
          return;
        }
        if (currentView === "grid") {
          container.innerHTML =
            '<div class="books-grid">' +
            filtered
              .map((book) => {
                const c = CAT_COLORS[book.category] || CAT_COLORS.Other;
                return (
                  '<div class="book-card"><div class="book-spine" style="background:' +
                  c.spine +
                  '"></div><div class="book-body"><span class="book-cat-badge" style="background:' +
                  c.bg +
                  ";color:" +
                  c.text +
                  '">' +
                  book.category +
                  '</span><div class="book-title">' +
                  book.title +
                  '</div><div class="book-author">by ' +
                  book.author +
                  "</div>" +
                  (book.rating
                    ? '<div class="book-stars">' + stars(book.rating) + "</div>"
                    : "") +
                  (book.notes
                    ? '<div class="book-notes">' + book.notes + "</div>"
                    : "") +
                  '</div><div class="book-footer"><span class="book-date">' +
                  fmtDate(book.added) +
                  '</span><button class="btn-delete" onclick="openDeleteModal(' +
                  book.id +
                  ')" title="Remove book">✕</button></div></div>'
                );
              })
              .join("") +
            "</div>";
        } else {
          container.innerHTML =
            '<div class="books-list">' +
            filtered
              .map((book) => {
                const c = CAT_COLORS[book.category] || CAT_COLORS.Other;
                return (
                  '<div class="book-list-row"><div class="row-spine" style="background:' +
                  c.spine +
                  '"></div><div class="row-info"><div class="book-title">' +
                  book.title +
                  '</div><div class="book-author">by ' +
                  book.author +
                  '</div></div><span class="row-cat" style="background:' +
                  c.bg +
                  ";color:" +
                  c.text +
                  '">' +
                  book.category +
                  '</span><div class="row-stars">' +
                  (book.rating
                    ? stars(book.rating)
                    : '<span style="color:#ddd">☆☆☆☆☆</span>') +
                  '</div><button class="btn-delete" onclick="openDeleteModal(' +
                  book.id +
                  ')" title="Remove">✕</button></div>'
                );
              })
              .join("") +
            "</div>";
        }
        renderWishlist();
      }

      if (!books.length) {
        books = [
          {
            id: 1,
            title: "The Name of the Wind",
            author: "Patrick Rothfuss",
            category: "Fantasy",
            rating: 5,
            notes:
              "An absolutely captivating story. The magic system is brilliant.",
            added: Date.now() - 86400000 * 10,
          },
          {
            id: 2,
            title: "And Then There Were None",
            author: "Agatha Christie",
            category: "Mystery",
            rating: 5,
            notes: "The classic whodunit masterpiece!",
            added: Date.now() - 86400000 * 8,
          },
          {
            id: 3,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            category: "Romance",
            rating: 4,
            notes: "Timeless and witty.",
            added: Date.now() - 86400000 * 6,
          },
          {
            id: 4,
            title: "Treasure Island",
            author: "Robert Louis Stevenson",
            category: "Adventure",
            rating: 4,
            notes: "Classic adventure on the high seas.",
            added: Date.now() - 86400000 * 5,
          },
          {
            id: 5,
            title: "The Haunting of Hill House",
            author: "Shirley Jackson",
            category: "Horror",
            rating: 4,
            notes: "Genuinely unsettling atmosphere.",
            added: Date.now() - 86400000 * 4,
          },
          {
            id: 6,
            title: "Dune",
            author: "Frank Herbert",
            category: "Sci-Fi",
            rating: 5,
            notes: "World-building on an epic scale.",
            added: Date.now() - 86400000 * 3,
          },
          {
            id: 7,
            title: "The Grimm's Fairy Tales",
            author: "Brothers Grimm",
            category: "Fairy Tale",
            rating: 4,
            notes: "Timeless stories for all ages.",
            added: Date.now() - 86400000 * 2,
          },
          {
            id: 8,
            title: "The Bronze Horseman",
            author: "Paullina Simons",
            category: "Historical",
            rating: 5,
            notes: "Epic wartime romance — absolutely devastating.",
            added: Date.now() - 86400000 * 1,
          },
        ];
        save();
      }

      render();