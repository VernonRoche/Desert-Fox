LATEX = latexmk
MAIN = main

.PHONY: all

all: pdf

pdf:
	$(LATEX) --pdf -shell-escape --halt-on-error $(MAIN).tex
custom:
	yes "" | $(LATEX) --pdf -shell-escape --halt-on-error $(MAIN).tex

clean:
	$(LATEX) -C $(MAIN).tex
	rm $(MAIN).bbl
