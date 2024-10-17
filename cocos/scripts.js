async function fetchMarkdown() {
    const response = await fetch('https://raw.githubusercontent.com/XHXIAIEIN/awesome-CocosCreator/refs/heads/main/data.md?token=GHSAT0AAAAAACZDZPZYCVUCW5VSPXVMRN7KZYRLZMA');
    const markdownText = await response.text();
    const htmlContent = marked(markdownText);
    document.getElementById('content').innerHTML = parseMarkdownToCards(htmlContent);
}

function parseMarkdownToCards(markdown) {
    const sections = markdown.split(/(<h4.*?>.*?<\/h4>)/g);
    let result = '';

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.match(/<h4.*?>.*?<\/h4>/)) {
            const title = section;
            const content = sections[i + 1] || '';

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;

            const listItems = tempDiv.querySelectorAll('li');
            let formattedContent = '<div class="page active">';

            listItems.forEach((item, index) => {
                const text = item.textContent.trim();
                const linkMatch = text.match(/(.*?)(https?:\/\/[^\s]+)/);

                if (linkMatch) {
                    const linkText = linkMatch[1].trim() || linkMatch[2];
                    const linkHref = linkMatch[2];

                    formattedContent += `<div><a href="${linkHref}" target="_blank">${linkText}</a></div>`;
                } else {
                    formattedContent += `<div>${text}</div>`;
                }

                if ((index + 1) % 5 === 0) {
                    formattedContent += '</div><div class="page">';
                }
            });

            formattedContent += '</div>'; 

            result += `
                <div class="card">
                    <div class="card-title">${title}</div>
                    <div class="card-content">${formattedContent}</div>
                    <div class="pagination"></div>
                </div>
            `;
            i++;
        }
    }
    return result;
}

let currentPage = 0;

function showPage(pageIndex) {
    const pages = document.querySelectorAll('.page');
    const indicators = document.querySelectorAll('.indicator');

    pages[currentPage].classList.remove('active');
    indicators[currentPage].classList.remove('active');

    currentPage = pageIndex;

    pages[currentPage].classList.add('active');
    indicators[currentPage].classList.add('active');
}


function updatePagination(card, activePage, totalPages) {
    const pagination = card.querySelector('.pagination');
    pagination.innerHTML = '';

    if (totalPages > 1) {
        pagination.classList.add('active');
        for (let i = 0; i < totalPages; i++) {
            const span = document.createElement('span');
            span.className = i === activePage ? 'active' : '';
            span.onclick = () => showPage(card, i);
            pagination.appendChild(span);
        }
    } else {
        pagination.classList.remove('active');
    }
}

fetchMarkdown();