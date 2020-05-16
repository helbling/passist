<style>
.spinner {
  position: absolute;
  width:  2em;
  height: 2em;
  top: 50%;
  left: 50%;
  transform:translate(-50%, -50%);
}
.ball {
    position: absolute;
	transform: translate(-50%, -50%);
	top:100%;
	left:100%;
    width:  1.2em;
    height: 1.2em;
    border-radius: 50%;
	animation: ball 3s infinite ease-in-out;
}
.a { animation-delay:0s;  background-color: #00dc3c }
.b { animation-delay:-1s; background-color: #ffd700}
.c { animation-delay:-2s; background-color: #ed4694 }

@keyframes ball {
  0%   { top:100%; left:100%; }
  25%  { top:0;    left:0; }
  50%  { top:100%; left:0; }
  75%  { top:0;    left:100%; }
  100% { top:100%; left:100%; }
}
</style>

<div class="spinner">
	<div class="ball a" />
	<div class="ball b" />
	<div class="ball c" />
</div>
