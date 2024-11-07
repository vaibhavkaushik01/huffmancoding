// min-heap class

class minHeap{

    constructor(){
        this.heap_array = [];
    }

    size(){
        return this.heap_array.length;
    }

    empty(){
        return this.size() === 0;
    }

    upHeapify(){
        let childindex = this.size() - 1;
        // parent index formula = (childindex - 1) / 2;
        while(childindex > 0){
            let parentindex = Math.floor((childindex - 1) / 2);
            let elem_at_child_index = this.heap_array[childindex];
            let elem_at_parent_index = this.heap_array[parentindex];
            if(elem_at_child_index[0] > elem_at_parent_index[0]){
                break;
            }else{
                //swap elements at childindex and parent index
                this.heap_array[childindex] = elem_at_parent_index;
                this.heap_array[parentindex] = elem_at_child_index;
                childindex = parentindex;
            }
        }
    }

    push(element){
        this.heap_array.push(element);
        this.upHeapify();
    }

    top(){
        return this.heap_array[0];
    }


    downHeapify(){
        let parentindex = 0;
        let parent_element = this.heap_array[0];

        while(parentindex < this.size()){
            let lci = (parentindex * 2) + 1; // lci = left child index
            let rci = (parentindex * 2) + 2; // rci = right child index
            if(lci >= this.size() && rci >= this.size()){
                break;
            }
            else if(rci >= this.size()){
                let lc_elem = this.heap_array[lci];
                if(parent_element[0] < lc_elem[0]){
                    break;
                }else{
                    this.heap_array[parentindex] = lc_elem;
                    this.heap_array[lci] = parent_element;
                    parentindex = lci;
                }
            }else{
                let rc_elem = this.heap_array[rci];
                let lc_elem = this.heap_array[lci];
                if(parent_element[0] < lc_elem[0] && parent_element[0] < rc_elem[0]){
                    break;
                }else{
                    if(lc_elem[0] < rc_elem[0]){
                        this.heap_array[lci] = parent_element;
                        this.heap_array[parentindex] = lc_elem;
                        parentindex = lci;
                    }else{
                        this.heap_array[rci] = parent_element;
                        this.heap_array[parentindex] = rc_elem;
                        parentindex = rci;
                    }
                }
            }
        }
    }

    pop(){
        //swap first and last element remove last elem
        if(this.empty() == false){
            let lastindex = this.size() - 1;
            let elem_at_last = this.heap_array[lastindex];
            this.heap_array[0] = elem_at_last;
            this.heap_array.pop();
            this.downHeapify();
        }
    }

};

class huffman{


    getCodes(node,code){
        //if leaf node then store code
        //node[1] will contain an array object for non leaf nodes
        if(typeof(node[1]) === "string"){
            this.codes[node[1]] = code;
            return;
        }
        this.getCodes(node[1][0] , code+'0');
        this.getCodes(node[1][1] , code+'1');
    }

    // make the humffman tree into a string
	make_string(node) {
		if (typeof (node[1]) === "string") {
			return "'" + node[1];
		}
		return '0' + this.make_string(node[1][0]) + '1' + this.make_string(node[1][1]);
	}

	// make string into huffman tree
	make_tree(tree_string) {
		let node = [];
		if (tree_string[this.index] === "'") {
			this.index++;
			node.push(tree_string[this.index]);
			this.index++;
			return node;
		}
		this.index++;
		node.push(this.make_tree(tree_string)); // find and push left child
		this.index++;
		node.push(this.make_tree(tree_string)); // find and push right child
		return node;
	}

    encode(data){
        this.heap = new minHeap();

        let map = new Map();
        for(let i=0;i<data.length;i++){
            if(map.has(data[i])){
                let instance = map.get(data[i]);
                map.set(data[i],instance + 1);
            }else{
                map.set(data[i],1);
            }
        }

        if (map.size === 0) {
			let final_string = "zer#";
			
			let output_message = "Compression complete and file sent for download. " + '\n' + "Compression Ratio : " + (data.length / final_string.length).toPrecision(6);
			return [final_string, output_message];
		}

        if (map.size === 1) {
			let key, value;
			for (let [k, v] of map) {
				key = k;
				value = v;
			}
			let final_string = "one" + '#' + key + '#' + value.toString();
			let output_message = "Compression complete and file sent for download. " + '\n' + "Compression Ratio : " + (data.length / final_string.length).toPrecision(6);
			return [final_string, output_message];
		}

        for(let [key,value] of map){
            this.heap.push([value,key]);
        }
        
        while(this.heap.size() > 1){
            let min_elem1 = this.heap.top();
            this.heap.pop();
            let min_elem2 = this.heap.top();
            this.heap.pop();
            
            let new_node = [min_elem1[0] + min_elem2[0],[min_elem1,min_elem2]];
            this.heap.push(new_node);
        }

        let huffman_tree_root = this.heap.top();
        this.heap.pop();
        this.codes = {};
        this.getCodes(huffman_tree_root,""); //empty string represent we are at root

        let binary_string = "";
        for(let i=0;i<data.length;i++){
            binary_string += this.codes[data[i]];
        }

        //padding_length is extra bit added to binary string to make it divisible to 8
        //so that it can be transferred as byte
        let padding_length = (8 - (binary_string.length % 8)) % 8;
        // adding 0s equal to padding length to binary_string
        for (let i = 0; i < padding_length; i++) {
			binary_string += '0';
		}
        let encoded_data = "";
		for (let i = 0; i < binary_string.length;) {
			let curr_num = 0;
			for (let j = 0; j < 8; j++, i++) {
				curr_num *= 2;
				curr_num += binary_string[i] - '0';
			}
            //creating decimal repersentaion of binary data as chunks of bytes
            //and generating unicode for it using string.fromcharcode method
			encoded_data += String.fromCharCode(curr_num);
		}

        let tree_string = this.make_string(huffman_tree_root);
		let ts_length = tree_string.length;
		let final_string = ts_length.toString() + '#' + padding_length.toString() + '#' + tree_string + encoded_data;
		let output_message = "Compression complete and file sent for download. " + '\n' + "Compression Ratio : " + (data.length / final_string.length).toPrecision(6);
		return [final_string, output_message];
    }

    decode(data){
        let k = 0;
		let temp = "";
		while (k < data.length && data[k] != '#') {
			temp += data[k];
			k++;
		}
		if (k == data.length){
			alert("Invalid File!\nPlease submit a valid compressed .txt file to decompress and try again!");
			location.reload();
			return;
		}
		if (temp === "zer") {
			let decoded_data = "";
			let output_message = "Decompression complete and file sent for download.";
			return [decoded_data, output_message];
		}
		if (temp === "one") {
			data = data.slice(k + 1);
			k = 0;
			temp = "";
			while (data[k] != '#') {
				temp += data[k];
				k++;
			}
			let one_char = temp;
			data = data.slice(k + 1);
			let str_len = parseInt(data);
			let decoded_data = "";
			for (let i = 0; i < str_len; i++) {
				decoded_data += one_char;
			}
			let output_message = "Decompression complete and file sent for download.";
			return [decoded_data, output_message];
		}

        data = data.slice(k + 1);
		let ts_length = parseInt(temp);

		k = 0;
		temp = "";
		while (data[k] != '#') {
			temp += data[k];
			k++;
		}
		data = data.slice(k + 1);
		let padding_length = parseInt(temp);

		temp = "";
		for (k = 0; k < ts_length; k++) {
			temp += data[k];
		}
		data = data.slice(k);
		let tree_string = temp;

		temp = "";
		for (k = 0; k < data.length; k++) {
			temp += data[k];
		}
		let encoded_data = temp;

		this.index = 0;
		let huffman_tree = this.make_tree(tree_string);

        //generating binary string from encoded data
        let binary_string = "";
        for(let i=0;i<encoded_data.length;i++){
            let curr_num = encoded_data.charCodeAt(i);
            let curr_binary = "";
            for(let j=7;j>=0;j--){
                if(((curr_num >> j) & 1) > 0){
                    curr_binary += '1';
                }else{
                    curr_binary += '0';
                }
            }
            binary_string += curr_binary;
        }

        // now we have to remove padding
        binary_string = binary_string.slice(0, -padding_length);

        let decoded_data = "";
		let node = huffman_tree;
		for (let i = 0; i < binary_string.length; i++) {
			if (binary_string[i] === '1') {
				node = node[1];
			}
			else {
				node = node[0];
			}

			if (typeof (node[0]) === "string") {
				decoded_data += node[0];
				node = huffman_tree;
			}
		}
		let output_message = "Decompression complete and file sent for download.";
		return [decoded_data, output_message];
    }
};

let code = new huffman();

const filedata = document.getElementById("filedata");
const fileinput = document.getElementById("fileinput");
const submitbtn = document.getElementById("submitbtn");
const encodebtn = document.getElementById("encode");
const decodebtn = document.getElementById("decode");

let isSubmitted = false;

submitbtn.addEventListener("click",()=>{
    console.log(fileinput.files);
    let uploadedfile = fileinput.files[0]
    if(uploadedfile == undefined){
        alert("No file uploaded. try again");
        return;
    }
    //check whether the uploaded file is a text file 
    let splitname = uploadedfile.name.split('.');
    let extension = splitname[splitname.length - 1].toLowerCase();
    if(extension != "txt"){
        alert("file submitted must be a txt file");
        return;
    }
    isSubmitted = true;
    alert("submitted");
});

encodebtn.addEventListener("click",()=>{
    if(isSubmitted === false){
        alert("No file is submitted yet. Please submit the file first.");
        return;
    }
    let uploadedfile = fileinput.files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(uploadedfile);
    fileReader.addEventListener("load",()=>{
        let data = fileReader.result;
        let [encodedString,output_message] = code.encode(data);
        myDownloadFile(uploadedfile.name.split('.')[0] + "_compressed.txt", encodedString);
    })

})

decodebtn.addEventListener("click",()=>{
    if(isSubmitted === false){
        alert("No file is submitted yet. Please submit the file first.");
        return;
    }
    let uploadedfile = fileinput.files[0];
    let fileReader = new FileReader();
    fileReader.readAsText(uploadedfile);
    fileReader.addEventListener("load",()=>{
        let data = fileReader.result;
        let [decodedString,output_message] = code.decode(data);
        myDownloadFile(uploadedfile.name.split('.')[0] + "_decompressed.txt", decodedString);
    })
})

function myDownloadFile(fileName, text) {
	let a = document.createElement('a');
	a.href = "data:application/octet-stream," + encodeURIComponent(text);
	a.download = fileName;
	a.click();
}

