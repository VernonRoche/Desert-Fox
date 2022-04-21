LATEX = latexmk
MAIN = main

.PHONY: all

all: pdf

pdf:
	latexmk --pdf -shell-escape --halt-on-error $(MAIN).tex

clean:
	$(LATEX) -C $(MAIN).tex
	rm $(MAIN).bbl
